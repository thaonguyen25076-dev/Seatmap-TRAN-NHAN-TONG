const VIEW_ONLY = window.VIEW_ONLY === true;

function seatPath(seatId) {
  return `seats/${window.MAP_KEY}/${seatId}`;
}

const rows = "ABCDEFGHIJKLM".split("");
const seatWrapper = document.getElementById("seatWrapper");
const bottomRow = document.getElementById("bottomRow");

/* ================== KHỞI TẠO SƠ ĐỒ ================== */
window.initSeatMap = function () {

  seatWrapper.innerHTML = "";
  bottomRow.innerHTML = "";

  /* ===== HÀNG A–M ===== */
  rows.forEach(row => {
    const rowDiv = document.createElement("div");
    rowDiv.className = "row";

    const left   = [17,16,15,14];
    const center = [13,12,11,10,9,8,7,6,5];
    const right  = [4,3,2,1];

    rowDiv.appendChild(createBlock(left, false, row));
    rowDiv.appendChild(createLabel(row));
    rowDiv.appendChild(createBlock(center, row <= "H", row));
    rowDiv.appendChild(createLabel(row));
    rowDiv.appendChild(createBlock(right, false, row));

    seatWrapper.appendChild(rowDiv);
  });

  /* ===== HÀNG N ===== */
  for (let i = 20; i >= 1; i--) {
    const seat = document.createElement("div");
    seat.className = "seat";
    seat.textContent = i;

    const seatId = "N" + i;
    if (!VIEW_ONLY) {
      seat.addEventListener("click", () => toggleSeat(seatId));
    }

    listenSeat(seatId, seat);
    bottomRow.appendChild(seat);
  }
};

/* ================== TIỆN ÍCH ================== */
function createLabel(text) {
  const d = document.createElement("div");
  d.className = "row-label";
  d.textContent = text;
  return d;
}

function createBlock(nums, red, row) {
  const block = document.createElement("div");
  block.className = "block";

  nums.forEach(n => {
    const seat = document.createElement("div");
    seat.className = "seat";
    seat.textContent = n;

    const seatId = row + n;
    if (red) seat.classList.add("center-red");

    if (!VIEW_ONLY) {
      seat.addEventListener("click", () => toggleSeat(seatId));
    }

    listenSeat(seatId, seat);
    block.appendChild(seat);
  });

  return block;
}

/* ================== FIREBASE ================== */
function toggleSeat(seatId) {
  const ref = db.ref(seatPath(seatId));

  ref.get().then(snap => {
    if (snap.exists()) {
      if (confirm(`MỞ ghế ${seatId}?`)) ref.remove();
    } else {
      if (confirm(`KHÓA ghế ${seatId}?`)) ref.set(true);
    }
  });
}

function listenSeat(seatId, el) {
  db.ref(seatPath(seatId)).on("value", snap => {
    el.classList.toggle("locked", snap.exists());
  });
}

/* ================== RESET MAP – THEO MAP HIỆN TẠI ================== */
if (!VIEW_ONLY) {
  const btn = document.getElementById("resetSeatsBtn");

  if (btn) {
    btn.addEventListener("click", () => {

      if (!window.MAP_KEY) {
        alert("Chưa chọn map!");
        return;
      }

      if (confirm("Bạn có muốn reset map?")) {

        // xóa toàn bộ ghế của map đang mở
        db.ref("seats/" + window.MAP_KEY).remove()
          .then(() => {
            alert("Đã reset xong map.");
          })
          .catch(err => {
            alert("Lỗi reset: " + err.message);
          });
      }
    });
  }
}

