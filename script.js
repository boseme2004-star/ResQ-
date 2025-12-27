// This is the JavaScript file - makes button work

// Wait for page to load
document.addEventListener('DOMContentLoaded', function() {
    
    // Get the button
    var myButton = document.getElementById('myButton');
    
    // When button is clicked
    myButton.addEventListener('click', function() {
        // Change button text
        myButton.innerHTML = 'Loading...';
        myButton.style.background = '#2c3e50';
        
        // Wait 1 second then go to login page
        setTimeout(function() {
            window.location.href = 'login.html';
        }, 1000);
    });
});