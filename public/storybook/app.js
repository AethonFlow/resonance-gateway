
const pages = ['pages/page_cover.png', 'pages/blank.png', 'pages/page_01_text.png', 'pages/page_01_img.png', 'pages/page_02_text.png', 'pages/page_02_img.png', 'pages/page_03_text.png', 'pages/page_03_img.png', 'pages/page_04_text.png', 'pages/page_04_img.png', 'pages/page_05_text.png', 'pages/page_05_img.png', 'pages/page_06_text.png', 'pages/page_06_img.png', 'pages/page_07_text.png', 'pages/page_07_img.png', 'pages/page_08_text.png', 'pages/page_08_img.png', 'pages/page_09_text.png', 'pages/page_09_img.png', 'pages/page_10_text.png', 'pages/page_10_img.png', 'pages/outro.png', 'pages/blank.png'];

let index = 0; // index of left page in current spread
const audio = new Audio('page-flip.wav');

function render() {
  const leftImg = pages[index] || "";
  const rightImg = pages[index+1] || "";
  document.getElementById('left').src = leftImg;
  document.getElementById('right').src = rightImg;
  document.getElementById('counter').textContent = Math.min(index+1, pages.length) + "–" + Math.min(index+2, pages.length) + " / " + pages.length;
  document.getElementById('prev').disabled = index <= 0;
  document.getElementById('next').disabled = index >= pages.length - 2;
}

function flip(dir) {
  const left = document.querySelector('.page.left');
  const right = document.querySelector('.page.right');
  if (dir > 0 && index < pages.length - 2) {
    right.classList.add('flip');
    left.classList.add('flip');
    audio.currentTime = 0;
    audio.play().catch(()=>{});
    setTimeout(()=>{
      index += 2;
      right.classList.remove('flip');
      left.classList.remove('flip');
      render();
    }, 620);
  } else if (dir < 0 && index > 0) {
    right.classList.add('flip');
    left.classList.add('flip');
    audio.currentTime = 0;
    audio.play().catch(()=>{});
    setTimeout(()=>{
      index -= 2;
      right.classList.remove('flip');
      left.classList.remove('flip');
      render();
    }, 620);
  }
}

window.addEventListener('DOMContentLoaded', ()=>{
  document.getElementById('prev').addEventListener('click', ()=>flip(-1));
  document.getElementById('next').addEventListener('click', ()=>flip(1));
  render();
});
