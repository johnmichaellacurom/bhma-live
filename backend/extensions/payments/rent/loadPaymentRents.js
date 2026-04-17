import {toast} from '../../../../backend/index.js'
import {openDatabase, dateFriendly, dateTimeFriendly, formatMoney, formatNumber} from '../../../../indexdb/database.js'

export function loadPaymentRents(limit, offset, current, showFrom, showTo, status, sort, method, search, hasRentId) {
  openDatabase().then(db => {
    
    const tx = db.transaction('payment_rents', 'readonly');
    const store = tx.objectStore('payment_rents');
    const filteredTotal = []; // store all matching first

    // STEP 1 — Count all filtered entries first
    store.openCursor().onsuccess = function (e) {
      const cursor = e.target.result;
      
      if (cursor) {
        const paymentRent = cursor.value;
        const matchSearch = search === '' || (
          (hasRentId) ? 
            paymentRent.rent_id == Number(search) : 
            paymentRent.payment_code.toLowerCase().includes(search.toLowerCase())
        );
        const matchStatus = status === '' || paymentRent.status === status;
        const matchMethod = method === '' || paymentRent.payment_method === method;

        if (matchSearch && matchStatus && matchMethod) filteredTotal.push(paymentRent);

        cursor.continue();
      } else {

        // STEP 2 — Pagination based on FILTERED TOTAL
        const totalEntries = filteredTotal.length;
        const entriesPerPage = Number(localStorage.getItem('settings-payments-entries-per-page')) || 10;
        const totalPages = Math.ceil(totalEntries / entriesPerPage);
        const currentPage = totalPages > 0 ? Number(current) : 0;

        $('#showingEntriesPaymentRents').text(`Showing ${totalPages > 0 ? showFrom : 0}-${totalPages > 0 ? showTo : 0} of ${formatNumber(totalEntries)} entries`);
        $('#pagePaymentRents').text(`Page ${totalPages > 0 ? currentPage : 0} of ${totalPages}`);
        $('#prevPagePaymentRents').prop('disabled', currentPage <= 1);
        $('#nextPagePaymentRents').prop('disabled', currentPage >= totalPages);

        // STEP 3 — Sort the filtered results
        filteredTotal.sort((a, b) => {
          return sort === 'Ascending'
            ? a.date_created.localeCompare(b.date_created)
            : b.date_created.localeCompare(a.date_created);
        });

        // STEP 4 — Slice based on pagination
        const finalPaymentRents = filteredTotal.slice(offset, offset + limit);

        // STEP 5 — Display final PaymentRents
        displayPaymentRents(db, finalPaymentRents);
      }
    };

  }).catch(() => toast('error', 'Database error.'));
}

function displayPaymentRents(db, paymentRents) {
  const tablePaymentRents = $('#tablePaymentRents')
  tablePaymentRents.empty()

  if (paymentRents.length <= 0) {
    tablePaymentRents.html('<tr id="tablePaymentRentsNoPaymentRentsFound"><td colspan="16">No payment rents found.</td></tr>');
    return;
  }

  paymentRents.forEach(paymentRent => {

    // rents
    const txRent = db.transaction('rents', 'readonly')
    const storeRent = txRent.objectStore('rents')
    const getRent = storeRent.get(parseInt(paymentRent.rent_id))
    getRent.onsuccess = () => {
      const rent = getRent.result
      const rentCode = rent.rent_code

      // boarder
      const txBoarder = db.transaction('boarders', 'readonly')
      const storeBoarder = txBoarder.objectStore('boarders')
      const getBoarder = storeBoarder.get(parseInt(rent.boarder_id))
      getBoarder.onsuccess = () => {
        const boarder = getBoarder.result
        const fullName = (
          `${boarder.first_name} ${boarder.middle_name} ${boarder.last_name} ${boarder.suffix}`
        ).replace(/\s+/g, ' ')
        .trim();
        const boarderName = `${boarder.nickname} - ${fullName}`

        tablePaymentRents.append(`
          <tr data-bs-toggle="modal" data-bs-target="#viewEditPaymentRentModal" id="viewEditPaymentRentModal${paymentRent.payment_rent_id}" class="view-edit-payment-rent-modal" data-payment-rent-id="${paymentRent.payment_rent_id}" data-date-created="${paymentRent.date_created}">
            <td>${rentCode}</td>
            <td>${boarderName}</td>
            <td>${paymentRent.payment_code}</td>
            <td><span class="badge ${
              paymentRent.status === 'Unpaid' ? 'text-bg-warning' : (
                paymentRent.status === 'Partially' ? 'text-bg-info' : (
                  paymentRent.status === 'Paid' ? 'text-bg-success' : (
                    paymentRent.status === 'Overdue' ? 'text-bg-danger' : 'text-bg-primary'
                  )
                )
              )
            }">${(paymentRent.status)}</span></td>
            <td>${dateFriendly(paymentRent.start_period)}</td>
            <td>${dateFriendly(paymentRent.end_period)}</td>
            <td>${dateFriendly(paymentRent.due_date)}</td>
            <td>${formatMoney(paymentRent.amount_due)}</td>
            <td>-${formatMoney(paymentRent.discount_amount)}</td>
            <td>${formatMoney(paymentRent.late_fee)}</td>
            <td>${formatMoney(paymentRent.total_amount_due)}</td>
            <td>${dateTimeFriendly(paymentRent.payment_datetime)}</td>
            <td>${paymentRent.payment_method}</td>
            <td>${paymentRent.notes}</td>
            <td>${dateTimeFriendly(paymentRent.last_modified)}</td>
            <td>${dateTimeFriendly(paymentRent.date_created)}</td>
          </tr>
        `)
      }
    }
  })
}
