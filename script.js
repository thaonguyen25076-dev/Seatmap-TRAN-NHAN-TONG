// ================== PHÂN QUYỀN ==================
// index.html (file khách) có: window.VIEW_ONLY = true
// admin.html KHÔNG có dòng này
const VIEW_ONLY = window.VIEW_ONLY === true;

// ================== CẤU HÌNH ==================
const rows = "ABCDEFGHIJKLM".split("");
const seatWrapper = document.getElementById("seatWrapper");
const bottomRow = document.getElementById("bottomRow");

// ================== TẠO HÀNG A–M ==================
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

// ================== LABEL ==================
function createLabel(text) {
  const d = document.createElement("div");
  d.className = "row-label";
  d.textContent = text;
  return d;
}

// ================== BLOCK GHẾ ==================
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

    // 👉 CHỈ ADMIN MỚI CLICK
    if (!VIEW_ONLY) {
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

  if (!VIEW_ONLY) {
    seat.addEventListener("click", () => toggleSeat(seatId));
  }

  listenSeat(seatId, seat);
  bottomRow.appendChild(seat);
}

// ================== FIREBASE + XÁC NHẬN ==================
function toggleSeat(seatId) {
  const ref = db.ref("seats/" + seatId);

  ref.get().then(snap => {

    // 👉 GHẾ ĐANG KHÓA → HỎI MỞ
    if (snap.exists()) {
      const ok = confirm(`Bạn có chắc chắn muốn MỞ ghế ${seatId} không?`);
      if (!ok) return;
      ref.remove();
    }

    // 👉 GHẾ CHƯA KHÓA → HỎI KHÓA
    else {
      const ok = confirm(`Bạn có chắc chắn muốn KHÓA ghế ${seatId} không?`);
      if (!ok) return;
      ref.set(true);
    }

  });
}

// ================== LẮNG NGHE TRẠNG THÁI ==================
function listenSeat(seatId, el) {
  db.ref("seats/" + seatId).on("value", snap => {
    el.classList.toggle("locked", snap.exists());
  });
}
// ================== RESET MAP (ADMIN) ==================
if (!VIEW_ONLY) {
  const resetBtn = document.getElementById("resetSeatsBtn");

  if (resetBtn) {
    resetBtn.addEventListener("click", () => {

      const ok = confirm(
        "Bạn có chắc chắn muốn RESET toàn bộ sơ đồ ghế không?\n\n" +
        "- Tất cả ghế đang KHÓA sẽ được MỞ lại\n" +
        "- Thao tác này KHÔNG THỂ hoàn tác"
      );

      if (!ok) return;

      db.ref("seats").remove()
        .then(() => {
          alert("Reset sơ đồ ghế thành công.");
        })
        .catch(err => {
          alert("Có lỗi khi reset.");
          console.error(err);
        });
    });
  }
}
