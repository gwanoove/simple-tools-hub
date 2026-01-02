const memo = document.getElementById("memo");
const STORAGE_KEY = "simple-memo-content";

const savedMemo = localStorage.getItem(STORAGE_KEY);
if (savedMemo) {
  memo.value = savedMemo;
}

memo.addEventListener("input", () => {
  localStorage.setItem(STORAGE_KEY, memo.value);
});