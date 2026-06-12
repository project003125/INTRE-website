// Shared navigation toggle script (M4)
// Replaces inline onclick handlers with accessible JS
document.addEventListener('DOMContentLoaded', function() {
    var toggles = document.querySelectorAll('.nav-toggle');
    toggles.forEach(function(btn) {
        btn.addEventListener('click', function() {
            var menu = document.getElementById('nav-menu');
            if (menu) {
                var isOpen = menu.classList.toggle('open');
                btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            }
        });
    });
});
