import {openDatabase, formatMoney, dateDatabase} from '../../../indexdb/database.js'

function computedRevenue(filterDate) {
  openDatabase().then(db => {
    const targetDate = filterDate ? filterDate : dateDatabase();

    let totals = {
      year: 0,
      month: 0,
      day: 0
    };

    function processDate(dateStr, amount) {
      const datePart = dateStr.split('T')[0]; // remove time
      const [year, month, day] = datePart.split('-');

      const [tYear, tMonth, tDay] = targetDate.split('-');

      // ✅ YEAR: sum all records (based on your expected output)
      if(year === tYear){
        totals.year += amount;
      }

      // ✅ MONTH: match month only
      if (month === tMonth) {
        totals.month += amount;
      }

      // ✅ DAY: match month + day
      if (month === tMonth && day === tDay) {
        totals.day += amount;
      }

      $('#dashboardRevenueDateFilter').prop('disabled', false)
    }

    // ✅ PAYMENT RENTS
    const tx1 = db.transaction(['payment_rents', 'rents'], 'readonly');
    const store1 = tx1.objectStore('payment_rents');
    const rentStore = tx1.objectStore('rents')
    const electricPercentTransient = Number(localStorage.getItem('settings-boarders-billing-amount-per-cycle-electric-percent-transient') || '20')
    const waterPercentTransient = Number(localStorage.getItem('settings-boarders-billing-amount-per-cycle-water-percent-transient') || '0')
    
    store1.openCursor().onsuccess = function (e) {
      const cursor = e.target.result;

      if (cursor) {
        const data = cursor.value;
        
        if(data.status === "Paid") {
          const rentRequest = rentStore.get(Number(data.rent_id))
          rentRequest.onsuccess = () => {
            const rentRecord = rentRequest.result
            if(rentRecord){
              if(rentRecord.rent_type === "Transient") {
                const rentPercentTransient = (100 - (electricPercentTransient + waterPercentTransient)) / 100
                processDate(data.payment_datetime, Number(data.amount_due) * rentPercentTransient);

              } else{
                processDate(data.payment_datetime, Number(data.total_amount_due));
              }
            }
          }
        }

        cursor.continue();
      }
    };

    // ✅ PAYMENT BILLS
    const tx2 = db.transaction('payment_bills', 'readonly');
    const store2 = tx2.objectStore('payment_bills');

    store2.openCursor().onsuccess = function (e) {
      const cursor = e.target.result;

      if (cursor) {
        const data = cursor.value;

        if(data.status === "Paid") {
          processDate(data.payment_datetime, Number(data.late_fee));
        }

        cursor.continue();
      }
    };

    // ✅ WAIT BOTH TX COMPLETE
    tx2.oncomplete = tx1.oncomplete = function () {
      $('#dashboardRevenueDateFilter').val(targetDate)

      $('#dashboardRevenueDayTotal').text(formatMoney(totals.day))
      $('#dashboardRevenueMonthTotal').text(formatMoney(totals.month))
      $('#dashboardRevenueYearTotal').text(formatMoney(totals.year))

      $('#dashboardRevenueDay').text(targetDate.split('-')[2])
      $('#dashboardRevenueMonth').text(
        new Date(targetDate.split('-')[0], Number(targetDate.split('-')[1]) - 1).toLocaleString('en-US', {
          month: 'long'
        })
      )
      $('#dashboardRevenueYear').text(targetDate.split('-')[0])
    };
  })
}

export function dashboardRevenue() {
  setTimeout(() => {
    $('#dashboardRevenue').load("pages/extensions/dashboard/revenue.html", () => {
      computedRevenue()

      $('#dashboardRevenueDateFilter').off('change').on('change', function() {
        $(this).prop('disabled', true)
        $('.dashboard-revenue-total').each(function() {
          $(this).text('...')
        })
        $('.dashboard-revenue').each(function() {
          $(this).text('...')
        })

        setTimeout(() => {
          computedRevenue($(this).val())
        }, TIMEOUT_MS);
      })
    })
  }, TIMEOUT_MS)
}