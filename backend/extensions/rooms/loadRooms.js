import {toast} from '../../../backend/index.js'
import {openDatabase, dateTimeFriendly, formatNumber} from '../../../indexdb/database.js'

export function loadRooms(limit, offset, current, showFrom, showTo, status, sort, search) {
  openDatabase().then(db => {

    const tx = db.transaction('rooms', 'readonly');
    const store = tx.objectStore('rooms');
    const filteredTotal = []; // store all matching first

    // STEP 1 — Count all filtered entries first
    store.openCursor().onsuccess = function (e) {
      const cursor = e.target.result;

      if (cursor) {
        const room = cursor.value;

        const matchSearch = search === '' || room.room_name.toLowerCase().includes(search.toLowerCase());
        const matchStatus = status === '' || room.status === status;

        if (matchSearch && matchStatus) filteredTotal.push(room);

        cursor.continue();
      } else {

        // STEP 2 — Pagination based on FILTERED TOTAL
        const totalEntries = filteredTotal.length;
        const entriesPerPage = Number(localStorage.getItem('settings-rooms-entries-per-page')) || 10;
        const totalPages = Math.ceil(totalEntries / entriesPerPage);
        const currentPage = totalPages > 0 ? Number(current) : 0;

        $('#showingEntriesRooms').text(`Showing ${totalPages > 0 ? showFrom : 0}-${totalPages > 0 ? showTo : 0} of ${formatNumber(totalEntries)} entries`);
        $('#pageRooms').text(`Page ${totalPages > 0 ? currentPage : 0} of ${totalPages}`);
        $('#prevPageRooms').prop('disabled', currentPage <= 1);
        $('#nextPageRooms').prop('disabled', currentPage >= totalPages);

        // STEP 3 — Sort the filtered results
        filteredTotal.sort((a, b) => {
          return sort === 'Ascending'
            ? a.room_name.localeCompare(b.room_name)
            : b.room_name.localeCompare(a.room_name);
        });

        // STEP 4 — Slice based on pagination
        const finalRooms = filteredTotal.slice(offset, offset + limit);

        // STEP 5 — Display final rooms
        displayRooms(finalRooms);
      }
    };

  }).catch(() => toast('error', 'Database error.'));
}

function displayRooms(rooms) {
  const tableRooms = $('#tableRooms')
  tableRooms.empty()

  if (rooms.length <= 0) {
    tableRooms.html('<tr id="tableRoomsNoRoomsFound"><td colspan="9">No rooms found.</td></tr>');
    return;
  }

  rooms.forEach(room => {
    tableRooms.append(`
      <tr data-bs-toggle="modal" data-bs-target="#viewEditRoomModal" id="viewEditRoomModal${room.room_id}" class="view-edit-room-modal" data-room-id="${room.room_id}" data-date-created="${room.date_created}">
        <td><span class="badge ${room.status === 'Active' ? 'text-bg-success' : 'text-bg-danger'}">${room.status}</span></td>
        <td>${room.room_name}</td>
        <td class='bg-info-subtle'>${room.total_lower_beds}</td>
        <td class='bg-info-subtle'>${room.lower_beds_left}</td>
        <td class='bg-success-subtle'>${room.total_upper_beds}</td>
        <td class='bg-success-subtle'>${room.upper_beds_left}</td>
        <td>${room.notes}</td>
        <td>${dateTimeFriendly(room.last_modified)}</td>
        <td>${dateTimeFriendly(room.date_created)}</td>
      </tr>
    `)
  })
}
