/* eslint-disable */

export const handleAlerts = () => {
  const ele = document.querySelector('.alert');

  if (ele) ele.parentElement.removeChild(ele);
};

export const showAlerts = (type, messg, time = 7) => {
  handleAlerts();
  const markupdiv = `<div class="alert alert--${type}">${messg}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', markupdiv);
  window.setTimeout(handleAlerts, time * 1000);
};
