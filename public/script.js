const container = document.querySelector('.container');
const register_button = document.querySelector('.register-btn');
const login_btn = document.querySelector('.login-btn');

register_button.addEventListener('click', () => {
    container.classList.add('active');
});

login_btn.addEventListener('click', () => {
    container.classList.remove('active');
});