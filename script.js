/* ====== CẤU HÌNH ====== */
const rows = "ABCDEFGHIJKLM".split("");
const seatWrapper = document.getElementById("seatWrapper");
const bottomRow = document.getElementById("bottomRow");

/* ====== TẠO HÀNG A–M ====== */
rows.forEach(row => {
  const rowDiv = document.createElement("div");
  rowDiv.className = "row";

  const left = [17, 16, 15, 14];
  const center = [13, 12, 11, 10, 9, 8, 7, 6, 5];
  const right = [4, 3, 2, 1];

  rowDiv.appendChild(createBlock(left, false, row));
  rowDiv.appendChild(createLabel(row));

  const isRedCenter = row <= "H";
  rowDiv.appendChild(createBlock(center, isRedCenter, row));

  rowDiv.appendChild(createLabel(row));
  rowDiv.appendChild(createBlock(right, false, row));

  seatWrapper.appendChild(rowDiv);
});

/* ====== CHỮ HÀNG ====== */
function createLabel(text) {
  const label = document.createElement("div");
  label.className = "row-label";
  label.textContent = text;
  return label;
}

/* ====== BLOCK GHẾ ====== */
function createBlock(numbers, red = false, currentRow = "") {
  const block = document.createElement("div");
  block.className = "block";

  numbers.forEach(n => {
    const seat = document.createElement("div");
    seat.className = "seat";

    const seatId = currentRow + n; // VD: A1
    seat.dataset.seat = seatId;
    seat.textContent = n;

    if (red) seat.classList.add("center-red");

    // click → khóa ghế (KHÔNG MỞ LẠI)
    seat.addEventListener("click", () => lockSeat(seatId));

    // realtime lắng nghe
    listenSeat(seatId, seat);

    block.appendChild(seat);
  });

  return block;
}

/* ====== HÀNG N ====== */
for (let i = 20; i >= 1; i--) {
  const seat = document.createElement("div");
  seat.className = "seat";

  const seatId = "N" + i;
  seat.dataset.seat = seatId;
  seat.textContent = i;

  seat.addEventListener("click", () => lockSeat(seatId));
  listenSeat(seatId, seat);

  bottomRow.appendChild(seat);
}

/* ====== FIREBASE ====== */

// 🔒 KHÓA GHẾ (CHỈ KHÓA – KHÔNG MỞ)
function lockSeat(seatId) {
  const ref = db.ref("seats/" + seatId);

  ref.once("value").then(snapshot => {
    if (snapshot.exists()) {
      // đã có người khóa → không làm gì
      return;
    }
    ref.set({
      locked: true,
      time: Date.now()
    });
  });
}

// 👀 REALTIME CẬP NHẬT GHẾ
function listenSeat(seatId, seatEl) {
  db.ref("seats/" + seatId).on("value", snapshot => {
    if (snapshot.exists()) {
      seatEl.classList.add("locked");
      seatEl.style.pointerEvents = "none";
    } else {
      seatEl.classList.remove("locked");
      seatEl.style.pointerEvents = "auto";
    }
  });
}
