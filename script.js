// ================== QUYỀN ==================
const VIEW_ONLY = window.VIEW_ONLY === true;

// ================== CẤU HÌNH ==================
const rows = "ABCDEFGHIJKLM".split("");
const seatWrapper = document.getElementById("seatWrapper");
const bottomRow = document.getElementById("bottomRow");

// ================== TẠO HÀNG ==================
rows.forEach(row => {
  const rowDiv = document.createElement("div");
  rowDiv.className = "row";

  const left = [17,16,15,14];
  const center = [13,12,11,10,9,8,7,6,5];
  const right = [4,3,2,1];

  rowDiv.appendChild(createBlock(left, false, row));
  rowDiv.appendChild(createLabel(row));
  rowDiv.appendChild(createBlock(center, row <= "H", row));
  rowDiv.appendChild(createLabel(row));
  rowDiv.appendChild(createBlock(right, false, row));

  seatWrapper.appendChild(rowDiv);
});

// ================== LABEL ==================
function createLabel(text) {
  const d = document.createElement("div");
  d.className = "row-label";
  d.textContent = text;
  return d;
}

// ================== GHẾ ==================
function createBlock(nums, red, row) {
  const block = document.createElement("div");
  block.className = "block";

  nums.forEach(n => {
    const seat = document.createElement("div");
    seat.className = "seat";
    seat.textContent = n;

    const seatId = row + n;
    seat.dataset.seat = seatId;

    if (red) seat.classList.add("center-red");

    // 🔒 KHÓA CỨNG CLICK CHO KHÁCH
    if (VIEW_ONLY) {
      seat.style.pointerEvents = "none";
    } else {
      seat.addEventListener("click", () => toggleSeat(seatId));
    }

    listenSeat(seatId, seat);
    block.appendChild(seat);
  });

  return block;
}

// ================== HÀNG N ==================
for (let i = 20; i >= 1; i--) {
  const seat = document.createElement("div");
  seat.className = "seat";
  seat.textContent = i;

  const seatId = "N" + i;
  seat.dataset.seat = seatId;

  if (VIEW_ONLY) {
    seat.style.pointerEvents = "none";
  } else {
    seat.addEventListener("click", () => toggleSeat(seatId));
  }

  listenSeat(seatId, seat);
  bottomRow.appendChild(seat);
}

// ================== FIREBASE ==================
function toggleSeat(seatId) {
  const ref = db.ref("seats/" + seatId);
  ref.get().then(snap => {
    snap.exists() ? ref.remove() : ref.set(true);
  });
}

function listenSeat(seatId, el) {
  db.ref("seats/" + seatId).on("value", snap => {
    el.classList.toggle("locked", snap.exists());
  });
}
