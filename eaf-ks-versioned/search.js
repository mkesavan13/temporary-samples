window.onload = () => {
  const results = document.querySelector('#tsd-search > ul');
  const searchAction = (event) => {
    const clickedResult = event.target;
    clickedResult.target = '_blank';
    clickedResult.href = clickedResult.href.replace('/samples','');
  }
  results.addEventListener('mousedown', searchAction);
  results.addEventListener('contextmenu', searchAction);
  document.body.addEventListener('keydown', (e) => {
    if(e.target.tagName === 'INPUT' && e.key === "/"){
      e.stopPropagation();
    }
  }, true);
}