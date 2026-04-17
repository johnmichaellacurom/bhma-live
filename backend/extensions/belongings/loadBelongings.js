import {toast} from '../../../backend/index.js'
import {openDatabase, dateTimeFriendly, formatMoney, formatNumber} from '../../../indexdb/database.js'

export function loadBelongings(limit, offset, current, showFrom, showTo, status, sort, type, search) {
  openDatabase().then(db => {
    
    const tx = db.transaction('belongings', 'readonly');
    const store = tx.objectStore('belongings');
    const filteredTotal = []; // store all matching first

    // STEP 1 — Count all filtered entries first
    store.openCursor().onsuccess = function (e) {
      const cursor = e.target.result;

      if (cursor) {
        const belonging = cursor.value;

        const matchSearch = search === '' || belonging.belonging_name.toLowerCase().includes(search.toLowerCase());
        const matchStatus = status === '' || belonging.status === status;
        const matchType = type === '' || belonging.belonging_type === type;

        if (matchSearch && matchStatus && matchType) filteredTotal.push(belonging);

        cursor.continue();
      } else {

        // STEP 2 — Pagination based on FILTERED TOTAL
        const totalEntries = filteredTotal.length;
        const entriesPerPage = Number(localStorage.getItem('settings-belongings-entries-per-page')) || 10;
        const totalPages = Math.ceil(totalEntries / entriesPerPage);
        const currentPage = totalPages > 0 ? Number(current) : 0;

        $('#showingEntriesBelongings').text(`Showing ${totalPages > 0 ? showFrom : 0}-${totalPages > 0 ? showTo : 0} of ${formatNumber(totalEntries)} entries`);
        $('#pageBelongings').text(`Page ${totalPages > 0 ? currentPage : 0} of ${totalPages}`);
        $('#prevPageBelongings').prop('disabled', currentPage <= 1);
        $('#nextPageBelongings').prop('disabled', currentPage >= totalPages);

        // STEP 3 — Sort the filtered results
        filteredTotal.sort((a, b) => {
          return sort === 'Ascending'
            ? a.belonging_name.localeCompare(b.belonging_name)
            : b.belonging_name.localeCompare(a.belonging_name);
        });

        // STEP 4 — Slice based on pagination
        const finalBelongings = filteredTotal.slice(offset, offset + limit);

        // STEP 5 — Display final Belongings
        displayBelongings(finalBelongings);
      }
    };

  }).catch(() => toast('error', 'Database error.'));
}

function displayBelongings(belongings) {
  const tableBelongings = $('#tableBelongings')
  tableBelongings.empty()

  if (belongings.length <= 0) {
    tableBelongings.html('<tr id="tableBelongingsNoBelongingsFound"><td colspan="7">No belongings found.</td></tr>');
    return;
  }

  belongings.forEach(belonging => {
    tableBelongings.append(`
      <tr data-bs-toggle="modal" data-bs-target="#viewEditBelongingModal" id="viewEditBelongingModal${belonging.belonging_id}" class="view-edit-belonging-modal" data-belonging-id="${belonging.belonging_id}" data-date-created="${belonging.date_created}">
        <td><span class="badge ${belonging.status === 'Active' ? 'text-bg-success' : 'text-bg-danger'}">${belonging.status}</span></td>
        <td>${belonging.belonging_name}</td>
        <td>${belonging.belonging_type}</td>
        <td>${formatMoney(belonging.charge)}</td>
        <td>${belonging.notes}</td>
        <td>${dateTimeFriendly(belonging.last_modified)}</td>
        <td>${dateTimeFriendly(belonging.date_created)}</td>
      </tr>
    `)
  })
}
