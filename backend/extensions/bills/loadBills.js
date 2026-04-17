import {toast} from '../../../backend/index.js'
import {openDatabase, dateTimeFriendly, dateFriendly, formatNumber, formatMoney} from '../../../indexdb/database.js'

export function loadBills(limit, offset, current, showFrom, showTo, status, sort, billType, search, hasBillId) {
  openDatabase().then(db => {

    const tx = db.transaction('bills', 'readonly');
    const store = tx.objectStore('bills');
    const filteredTotal = []; // store all matching first

    store.openCursor().onsuccess = function (e) {
      const cursor = e.target.result;

      if (cursor) {
        const bill = cursor.value;

        const matchSearch = search === '' || (
          (hasBillId) ? 
            bill.bill_id == Number(search) : 
            bill.bill_code.toLowerCase().includes(search.toLowerCase())
        );
        const matchStatus = status === '' || bill.status === status;
        const matchBillType = billType === '' || bill.bill_type === billType

        if (matchSearch && matchStatus && matchBillType) filteredTotal.push(bill);

        cursor.continue();
      } else {

        const totalEntries = filteredTotal.length;
        const entriesPerPage = Number(localStorage.getItem('settings-bills-entries-per-page')) || 10;
        const totalPages = Math.ceil(totalEntries / entriesPerPage);
        const currentPage = totalPages > 0 ? Number(current) : 0;

        $('#showingEntriesBills').text(`Showing ${totalPages > 0 ? showFrom : 0}-${totalPages > 0 ? showTo : 0} of ${formatNumber(totalEntries)} entries`);
        $('#pageBills').text(`Page ${totalPages > 0 ? currentPage : 0} of ${totalPages}`);
        $('#prevPageBills').prop('disabled', currentPage <= 1);
        $('#nextPageBills').prop('disabled', currentPage >= totalPages);

        filteredTotal.sort((a, b) => {
          return sort === 'Ascending'
            ? a.bill_code.localeCompare(b.bill_code)
            : b.bill_code.localeCompare(a.bill_code);
        });
        const finalBills = filteredTotal.slice(offset, offset + limit);
        displayBills(db, finalBills);
      }
    };

  }).catch(() => toast('error', 'Database error.'));
}

function displayBills(db, bills) {
  const tableBills = $('#tableBills')
  tableBills.empty()

  if (bills.length <= 0) {
    tableBills.html('<tr id="tableBillsNoBillsFound"><td colspan="13">No bills found.</td></tr>');
    return;
  }

  bills.forEach(bill => {
    tableBills.append(`
      <tr data-bs-toggle="modal" data-bs-target="#viewEditBillModal" id="viewEditBillModal${bill.bill_id}" class="view-edit-bill-modal" data-bill-id="${bill.bill_id}" data-date-created="${bill.date_created}">
        <td>${bill.bill_code}</td>
        <td><span class="badge ${
          bill.status === 'Unpaid' ? 'text-bg-warning' : (
            bill.status === 'Partially' ? 'text-bg-info' : (
              bill.status === 'Paid' ? 'text-bg-success' : (
                bill.status === 'Overdue' ? 'text-bg-danger' : 'text-bg-primary'
              )
            )
          )
        }">${bill.status}</span></td>
        <td>${bill.bill_type}</td>
        <td>${bill.room_name}</td>
        <td>${dateFriendly(bill.start_period)}</td>
        <td>${dateFriendly(bill.end_period)}</td>
        <td>${dateFriendly(bill.due_date)}</td>
        <td>${formatMoney(bill.amount)}</td>
        <td>${formatMoney(bill.remaining)}</td>
        <td>${formatMoney(bill.late_fees)}</td>
        <td>${bill.notes}</td>
        <td>${dateTimeFriendly(bill.last_modified)}</td>
        <td>${dateTimeFriendly(bill.date_created)}</td>
      </tr>
    `)
  })
}
