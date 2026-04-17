import {toast} from '../../../backend/index.js'
import {openDatabase, dateTimeFriendly, formatNumber} from '../../../indexdb/database.js'

export function loadRents(limit, offset, current, showFrom, showTo, status, sort, bedLevel, rentType, search, hasBoarderId, hasRentId) {
  openDatabase().then(db => {

    const tx = db.transaction('rents', 'readonly');
    const store = tx.objectStore('rents');
    const filteredTotal = []; // store all matching first

    store.openCursor().onsuccess = function (e) {
      const cursor = e.target.result;

      if (cursor) {
        const rent = cursor.value;

        const matchSearch = search === '' || (
          (hasBoarderId) ? 
            rent.boarder_id == Number(search) : 
            (
              (hasRentId) ?
              rent.rent_id == Number(search) : 
              rent.rent_code.toLowerCase().includes(search.toLowerCase())
            )
        );
        const matchStatus = status === '' || rent.status === status;
        const matchBedLevel = bedLevel === '' || rent.bed_level === bedLevel
        const matchRentType = rentType === '' || rent.rent_type === rentType

        if (matchSearch && matchStatus && matchBedLevel && matchRentType) filteredTotal.push(rent);

        cursor.continue();
      } else {

        const totalEntries = filteredTotal.length;
        const entriesPerPage = Number(localStorage.getItem('settings-rents-entries-per-page')) || 10;
        const totalPages = Math.ceil(totalEntries / entriesPerPage);
        const currentPage = totalPages > 0 ? Number(current) : 0;

        $('#showingEntriesRents').text(`Showing ${totalPages > 0 ? showFrom : 0}-${totalPages > 0 ? showTo : 0} of ${formatNumber(totalEntries)} entries`);
        $('#pageRents').text(`Page ${totalPages > 0 ? currentPage : 0} of ${totalPages}`);
        $('#prevPageRents').prop('disabled', currentPage <= 1);
        $('#nextPageRents').prop('disabled', currentPage >= totalPages);

        filteredTotal.sort((a, b) => {
          return sort === 'Ascending'
            ? a.rent_code.localeCompare(b.rent_code)
            : b.rent_code.localeCompare(a.rent_code);
        });
        const finalRents = filteredTotal.slice(offset, offset + limit);
        displayRents(db, finalRents);
      }
    };

  }).catch(() => toast('error', 'Database error.'));
}

function displayRents(db, rents) {
  const tableRents = $('#tableRents')
  tableRents.empty()

  if (rents.length <= 0) {
    tableRents.html('<tr id="tableRentsNoRentsFound"><td colspan="13">No rents found.</td></tr>');
    return;
  }

  rents.forEach(rent => {

    //boarder
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

      // rent belongings
      const tx = db.transaction("rent_belongings", "readonly");
      const store = tx.objectStore("rent_belongings");
      const index = store.index("rent_id");

      const belongings = [];
      const request = index.openCursor(IDBKeyRange.only(Number(rent.rent_id)));
      request.onsuccess = (e) => {
        const cursor = e.target.result;
        if (cursor) {
          const rent = cursor.value

          if(rent.checked == '1'){
            const txBelonging = db.transaction('belongings', 'readonly')
            const storeBelonging = txBelonging.objectStore('belongings')

            // get the existing Belonging
            const getRequestBelonging = storeBelonging.get(parseInt(rent.belonging_id))
            getRequestBelonging.onsuccess = () => {
              belongings.push(" "+getRequestBelonging.result.belonging_name)
            }
          }

          cursor.continue(); // get next
        } else {

          // room
          const txRoom = db.transaction('rooms', 'readonly')
          const storeRoom = txRoom.objectStore('rooms')
          const getRoom = storeRoom.get(parseInt(rent.room_id))
          getRoom.onsuccess = () => {
            const roomName = getRoom.result.room_name

            tableRents.append(`
              <tr data-bs-toggle="modal" data-bs-target="#viewEditRentModal" id="viewEditRentModal${rent.rent_id}" class="view-edit-rent-modal" data-rent-id="${rent.rent_id}" data-date-created="${rent.date_created}">
                <td>${rent.rent_code}</td>
                <td><span class="badge ${
                  rent.status === 'Ongoing' ? 'text-bg-info' : (
                    rent.status === 'On Break' ? 'text-bg-primary' : (
                      rent.status === 'Unpaid' ? 'text-bg-warning' : 'text-bg-success'
                    )
                  )
                }">${rent.status}</span></td>
                <td>${boarderName}</td>
                <td>${belongings}</td>
                <td>${roomName}</td>
                <td>${rent.bed_level}</td>
                <td>${rent.rent_type}</td>
                <td>${rent.discount_percent}</td>
                <td>${dateTimeFriendly(rent.check_in)}</td>
                <td>${dateTimeFriendly(rent.check_out)}</td>
                <td>${rent.notes}</td>
                <td>${dateTimeFriendly(rent.last_modified)}</td>
                <td>${dateTimeFriendly(rent.date_created)}</td>
              </tr>
            `)
          }
        }
      };
    }
  })
}
