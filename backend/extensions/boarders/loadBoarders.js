import {toast} from '../../../backend/index.js'
import {openDatabase, dateTimeFriendly, dateFriendly, formatNumber} from '../../../indexdb/database.js'
import {getAge} from './getAge.js'

export function loadBoarders(limit, offset, current, showFrom, showTo, status, sort, sex, search, hasBoarderId) {
  openDatabase().then(db => {

    const tx = db.transaction('boarders', 'readonly');
    const store = tx.objectStore('boarders');
    const filteredTotal = []; // store all matching first

    // STEP 1 — Count all filtered entries first
    store.openCursor().onsuccess = function (e) {
      const cursor = e.target.result;

      if (cursor) {
        const boarder = cursor.value;

        const fullName = (
          `${boarder.first_name} ${boarder.middle_name} ${boarder.last_name} ${boarder.suffix}`
        )
          .toLowerCase()
          .replace(/\s+/g, ' ')
          .trim();
        
        const firstLastName = (
          `${boarder.first_name} ${boarder.last_name}`
        )
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim()

        const matchSearch = search === '' || (
          (hasBoarderId) ? 
            boarder.boarder_id == Number(search) : 
            (
              fullName.toLowerCase().includes(search.toLowerCase()) || 
              firstLastName.toLowerCase().includes(search.toLowerCase()) ||
              boarder.address.toLowerCase().includes(search.toLowerCase()) || 
              boarder.mobile_no.includes(search) || 
              boarder.facebook_acc.toLowerCase().includes(search.toLowerCase())
            )
        );
        const matchStatus = status === '' || boarder.status === status;
        const matchSex = sex === '' || boarder.sex === sex;

        if (matchSearch && matchStatus && matchSex) filteredTotal.push(boarder);

        cursor.continue();
      } else {

        // STEP 2 — Pagination based on FILTERED TOTAL
        const totalEntries = filteredTotal.length;
        const entriesPerPage = Number(localStorage.getItem('settings-boarders-entries-per-page')) || 10;
        const totalPages = Math.ceil(totalEntries / entriesPerPage);
        const currentPage = totalPages > 0 ? Number(current) : 0;

        $('#showingEntriesBoarders').text(`Showing ${totalPages > 0 ? showFrom : 0}-${totalPages > 0 ? showTo : 0} of ${formatNumber(totalEntries)} entries`);
        $('#pageBoarders').text(`Page ${totalPages > 0 ? currentPage : 0} of ${totalPages}`);
        $('#prevPageBoarders').prop('disabled', currentPage <= 1);
        $('#nextPageBoarders').prop('disabled', currentPage >= totalPages);

        // STEP 3 — Sort the filtered results
        filteredTotal.sort((a, b) => {
          return sort === 'Ascending'
            ? a.first_name.localeCompare(b.first_name)
            : b.first_name.localeCompare(a.first_name);
        });

        // STEP 4 — Slice based on pagination
        const finalBoarders = filteredTotal.slice(offset, offset + limit);

        // STEP 5 — Display final Boarders
        displayBoarders(finalBoarders);
      }
    };

  }).catch(() => toast('error', 'Database error.'));
}

function displayBoarders(boarders) {
  const tableBoarders = $('#tableBoarders')
  tableBoarders.empty()

  if (boarders.length <= 0) {
    tableBoarders.html('<tr id="tableBoardersNoBoardersFound"><td colspan="15">No boarders found.</td></tr>');
    return;
  }

  boarders.forEach(boarder => {
    tableBoarders.append(`
      <tr data-bs-toggle="modal" data-bs-target="#viewEditBoarderModal" id="viewEditBoarderModal${boarder.boarder_id}" class="view-edit-boarder-modal" data-boarder-id="${boarder.boarder_id}" data-date-created="${boarder.date_created}">
        <td><span class="badge ${boarder.status === 'Active' ? 'text-bg-success' : 'text-bg-danger'}">${boarder.status}</span></td>
        <td>${boarder.first_name}</td>
        <td>${boarder.middle_name}</td>
        <td>${boarder.last_name}</td>
        <td>${boarder.suffix}</td>
        <td>${boarder.nickname}</td>
        <td>${dateFriendly(boarder.birth_date)}</td>
        <td>${getAge(boarder.birth_date)}</td>
        <td>${boarder.sex}</td>
        <td>${boarder.address}</td>
        <td>${boarder.mobile_no}</td>
        <td>${boarder.facebook_acc}</td>
        <td>${boarder.notes}</td>
        <td>${dateTimeFriendly(boarder.last_modified)}</td>
        <td>${dateTimeFriendly(boarder.date_created)}</td>
      </tr>
    `)
  })
}
