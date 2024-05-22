document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    loginUser(username, password);
});

function loginUser(username, password) {
    fetch('https://zone01normandie.org/api/auth/signin', {
        method: 'POST',
        headers: {
            'Authorization': 'Basic ' + btoa(username + ":" + password)
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        sessionStorage.setItem('jwt', data);
        console.log(data)
       window.location.href = '/profile.html';
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
        document.getElementById('message').textContent = 'Failed to login.';
    });
}

