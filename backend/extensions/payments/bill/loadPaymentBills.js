import {toast} from '../../../../backend/index.js'
import {openDatabase, dateFriendly, dateTimeFriendly, formatMoney, formatNumber} from '../../../../indexdb/database.js'

export function loadPaymentBills(limit, offset, current, showFrom, showTo, status, sort, method, search, hasBillId) {
  openDatabase().then(db => {
    
    const tx = db.transaction('payment_bills', 'readonly');
    const store = tx.objectStore('payment_bills');
    const filteredTotal = []; // store all matching first

    // STEP 1 — Count all filtered entries first
    store.openCursor().onsuccess = function (e) {
      const cursor = e.target.result;

      if (cursor) {
        const paymentBill = cursor.value;
        const matchSearch = search === '' || (
          (hasBillId) ? 
            paymentBill.bill_id == Number(search) : 
            paymentBill.payment_code.toLowerCase().includes(search.toLowerCase())
        );
        const matchStatus = status === '' || paymentBill.status === status;
        const matchMethod = method === '' || paymentBill.payment_method === method;

        if (matchSearch && matchStatus && matchMethod) filteredTotal.push(paymentBill);

        cursor.continue();
      } else {

        // STEP 2 — Pagination based on FILTERED TOTAL
        const totalEntries = filteredTotal.length;
        const entriesPerPage = Number(localStorage.getItem('settings-payments-entries-per-page')) || 10;
        const totalPages = Math.ceil(totalEntries / entriesPerPage);
        const currentPage = totalPages > 0 ? Number(current) : 0;

        $('#showingEntriesPaymentBills').text(`Showing ${totalPages > 0 ? showFrom : 0}-${totalPages > 0 ? showTo : 0} of ${formatNumber(totalEntries)} entries`);
        $('#pagePaymentBills').text(`Page ${totalPages > 0 ? currentPage : 0} of ${totalPages}`);
        $('#prevPagePaymentBills').prop('disabled', currentPage <= 1);
        $('#nextPagePaymentBills').prop('disabled', currentPage >= totalPages);

        // STEP 3 — Sort the filtered results
        filteredTotal.sort((a, b) => {
          return sort === 'Ascending'
            ? a.date_created.localeCompare(b.date_created)
            : b.date_created.localeCompare(a.date_created);
        });

        // STEP 4 — Slice based on pagination
        const finalPaymentBills = filteredTotal.slice(offset, offset + limit);

        // STEP 5 — Display final PaymentBills
        displayPaymentBills(db, finalPaymentBills);
      }
    };

  }).catch(() => toast('error', 'Database error.'));
}

function displayPaymentBills(db, paymentBills) {
  const tablePaymentBills = $('#tablePaymentBills')
  tablePaymentBills.empty()

  if (paymentBills.length <= 0) {
    tablePaymentBills.html('<tr id="tablePaymentBillsNoPaymentBillsFound"><td colspan="16">No payment bills found.</td></tr>');
    return;
  }

  paymentBills.forEach(paymentBill => {

    // bills
    const txBill = db.transaction('bills', 'readonly')
    const storeBill = txBill.objectStore('bills')
    const getBill = storeBill.get(parseInt(paymentBill.bill_id))
    getBill.onsuccess = () => {
      const bill = getBill.result
      const billCode = bill.bill_code
      const billType = bill.bill_type

      // rents
      const txRent = db.transaction('rents', 'readonly')
      const storeRent = txRent.objectStore('rents')
      const getRent = storeRent.get(parseInt(paymentBill.rent_id))
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
  
          tablePaymentBills.append(`
            <tr data-bs-toggle="modal" data-bs-target="#viewEditPaymentBillModal" id="viewEditPaymentBillModal${paymentBill.payment_bill_id}" class="view-edit-payment-bill-modal" data-payment-bill-id="${paymentBill.payment_bill_id}" data-date-created="${paymentBill.date_created}">
              <td>${billCode}</td>
              <td>${billType}</td>
              <td>${rentCode}</td>
              <td>${boarderName}</td>
              <td>${paymentBill.payment_code}</td>
              <td><span class="badge ${
                paymentBill.status === 'Unpaid' ? 'text-bg-warning' : (
                  paymentBill.status === 'Partially' ? 'text-bg-info' : (
                    paymentBill.status === 'Paid' ? 'text-bg-success' : (
                      paymentBill.status === 'Overdue' ? 'text-bg-danger' : 'text-bg-primary'
                    )
                  )
                )  
              }">${(paymentBill.status)}</span></td>
              <td>${dateFriendly(paymentBill.start_period)}</td>
              <td>${dateFriendly(paymentBill.end_period)}</td>
              <td>${dateFriendly(paymentBill.due_date)}</td>
              <td class='d-none'>${(billType === 'Electric') ? formatMoney(paymentBill.belongings) : 'Not Applicable'}</td>
              <td>${formatMoney(paymentBill.amount_due)}</td>
              <td>${formatMoney(paymentBill.late_fee)}</td>
              <td>${formatMoney(paymentBill.total_amount_due)}</td>
              <td>${dateTimeFriendly(paymentBill.payment_datetime)}</td>
              <td>${paymentBill.payment_method}</td>
              <td>${paymentBill.notes}</td>
              <td>${dateTimeFriendly(paymentBill.last_modified)}</td>
              <td>${dateTimeFriendly(paymentBill.date_created)}</td>
            </tr>
          `)
        }
      }
    }
  })
}
