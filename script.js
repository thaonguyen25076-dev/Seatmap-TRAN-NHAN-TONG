const VIEW_ONLY = window.VIEW_ONLY === true;

function seatPath(seatId) {
  return `seats/${window.MAP_KEY}/${seatId}`;
}

const rows = "ABCDEFGHIJKLM".split("");
const seatWrapper = document.getElementById("seatWrapper");
const bottomRow = document.getElementById("bottomRow");

/* ================== KHỞI TẠO ================== */
window.initSeatMap = function () {
  if (!window.MAP_KEY) return;

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

    if (window.MAP_KEY === "show2") {
      seat.classList.add("normal300");
    }

    if (!VIEW_ONLY) {
      seat.addEventListener("click", () => toggleSeat(seatId));
    }

    listenSeat(seatId, seat);
    bottomRow.appendChild(seat);
  }

  updateStat();
  function updateStatShow2() {
  const ref = db.ref("seats/" + window.MAP_KEY);

  ref.once("value").then(snap => {

    let A = 0;
    let B = 0;
    let C = 0;

    snap.forEach(s => {
      const seatId = s.key;

      const row = seatId[0];
      const num = parseInt(seatId.slice(1));
      const isCenter = num >= 5 && num <= 13;

      // 🔴 HẠNG A
      if (isCenter && row <= "H") {
        A++;
      }

      // 🟡 HẠNG B
      else if (
        (isCenter && row >= "I" && row <= "M") ||
        (!isCenter && row >= "A" && row <= "E")
      ) {
        B++;
      }

      // 🟢 HẠNG C
      else {
        C++;
      }
    });

    const sold = A + B + C;
    const totalSeats = 241;

    document.getElementById("vipCount").innerText = A;
    document.getElementById("normalCount").innerText = B;
    document.getElementById("cCount").innerText = C;

    document.getElementById("soldCount").innerText = sold;
    document.getElementById("remainCount").innerText = totalSeats - sold;

    const rate = ((sold / totalSeats) * 100).toFixed(1);
    document.getElementById("fillRate").innerText = rate;

    // 💰 TIỀN
    const moneyA = A * 500000;
    const moneyB = B * 400000;
    const moneyC = C * 300000;

    document.getElementById("vipMoney").innerText = moneyA.toLocaleString();
    document.getElementById("normalMoney").innerText =
      (moneyB + moneyC).toLocaleString();

    document.getElementById("totalMoney").innerText =
      (moneyA + moneyB + moneyC).toLocaleString();
    if (selectedDate === "2025-03-09") {
  // thống kê riêng 9/3
  document.getElementById("vipCount").textContent = vip;
  document.getElementById("normalCount").textContent = normal;
  document.getElementById("cCount").textContent = c;
  document.getElementById("soldCount").textContent = sold;
}
  });
}
};

/* ================== UI ================== */
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
    const isCenter = n >= 5 && n <= 13;

    /* ================== VỞ 9/3 ================== */
    if (window.MAP_KEY === "show2") {

      if (red && isCenter) {
        seat.classList.add("center-red");
      }
      else if (isCenter && row >= "I" && row <= "M") {
        seat.classList.add("vip400");
      }
      else if (!isCenter && row >= "A" && row <= "E") {
        seat.classList.add("vip400");
      }
      else {
        seat.classList.add("normal300");
      }

    }

    /* ================== TRẦN NHÂN TÔNG ================== */
    else {

      if (red && isCenter) {
        seat.classList.add("center-red"); // ghế đỏ giữa
      }
      else {
        seat.classList.add("normal300"); // còn lại thường
      }

    }

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
      if (confirm(`MỞ ghế ${seatId}?`)) {
        ref.remove().then(updateStat);
      }
    } else {
      if (confirm(`KHÓA ghế ${seatId}?`)) {
        ref.set(true).then(updateStat);
      }
    }
  });
}

function listenSeat(seatId, el) {
  db.ref(seatPath(seatId)).on("value", snap => {
    el.classList.toggle("locked", snap.exists());
  });
}

/* ================== RESET ================== */
if (!VIEW_ONLY) {
  const btn = document.getElementById("resetSeatsBtn");

  if (btn) {
    btn.addEventListener("click", () => {
      if (!window.MAP_KEY) {
        alert("Chưa chọn map!");
        return;
      }

      if (confirm("Bạn có muốn reset toàn bộ ghế?")) {
        db.ref("seats/" + window.MAP_KEY).remove()
          .then(() => {
            alert("Đã reset!");
            updateStat();
          })
          .catch(err => alert("Lỗi: " + err.message));
      }
    });
  }
}

/* ================== GIÁ ================== */
const PRICE_VIP = 400000;
const PRICE_NORMAL = 300000;
const TOTAL_SEATS = 241;

/* ================== THỐNG KÊ ================== */
function updateStat() {
  if (!window.MAP_KEY) return;

  if (!document.getElementById("vipCount")) return;

  db.ref("seats/" + window.MAP_KEY).once("value").then(snap => {
    let vip = 0;
    let normal = 0;

    snap.forEach(s => {
      if (isVipSeat(s.key)) vip++;
      else normal++;
    });

    const sold = vip + normal;
    const remain = TOTAL_SEATS - sold;
    const fillRate = ((sold / TOTAL_SEATS) * 100).toFixed(1);
    
    document.getElementById("vipCount").textContent = vip;
    document.getElementById("normalCount").textContent = normal;
    document.getElementById("soldCount").textContent = sold;
    document.getElementById("remainCount").textContent = remain;
    document.getElementById("fillRate").textContent = fillRate;
    

    document.getElementById("vipMoney").textContent =
      (vip * PRICE_VIP).toLocaleString("vi-VN");

    document.getElementById("normalMoney").textContent =
      (normal * PRICE_NORMAL).toLocaleString("vi-VN");

    document.getElementById("totalMoney").textContent =
      ((vip * PRICE_VIP) + (normal * PRICE_NORMAL)).toLocaleString("vi-VN");
  });
  
}

function isVipSeat(seatId) {
  const row = seatId[0];
  const num = parseInt(seatId.slice(1));
  return row <= "H" && num >= 5 && num <= 13;
}

/* ===== ẨN THỐNG KÊ BÊN KHÁCH ===== */
const statBtn = document.getElementById("statBtn");
if (statBtn && VIEW_ONLY) {
  statBtn.style.display = "none";
}
function updateTicketUI() {
  const cards = document.querySelectorAll(".ticket-card");

  if (cards.length < 2) return;

  const card1 = cards[0];
  const card2 = cards[1];

  if (window.MAP_KEY === "show2") {
    
    card1.querySelector(".ticket-badge").textContent = "A";
    card1.querySelector(".ticket-badge").className = "ticket-badge blue";

    card1.querySelector(".ticket-name").textContent = "HẠNG A";
    card1.querySelector(".ticket-price").textContent = "500,000đ";

    card2.querySelector(".ticket-badge").textContent = "C";
    card2.querySelector(".ticket-badge").className = "ticket-badge gold";

    card2.querySelector(".ticket-name").textContent = "HẠNG C";
    card2.querySelector(".ticket-price").textContent = "300,000đ";

    if (!document.getElementById("vip500")) {
      const newCard = card2.cloneNode(true);
      newCard.id = "vip500";

      newCard.querySelector(".ticket-badge").textContent = "B";
      newCard.querySelector(".ticket-badge").className = "ticket-badge red";

      newCard.querySelector(".ticket-name").textContent = "HẠNG B";
      newCard.querySelector(".ticket-price").textContent = "400,000đ";

      card2.parentNode.insertBefore(newCard, card2);
    }

  } else {
    const red = document.getElementById("vip500");
    if (red) red.remove();

    card1.querySelector(".ticket-badge").textContent = "STANDARD";
    card1.querySelector(".ticket-badge").className = "ticket-badge standard";
    card1.querySelector(".ticket-name").textContent = "STANDARD";
    card1.querySelector(".ticket-price").textContent = "300,000đ";

    card2.querySelector(".ticket-badge").textContent = "VIP";
    card2.querySelector(".ticket-badge").className = "ticket-badge vip";
    card2.querySelector(".ticket-name").textContent = "VIP";
    card2.querySelector(".ticket-price").textContent = "400,000đ";
  }
}
