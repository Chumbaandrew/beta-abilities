console.log("JavaScript loaded");

//function for forgot password
function forgot(){
    alert("Shauri yako !");
}
/*----highlighting the navbar as the page scrolls*/

const sections = document.querySelectorAll("section");
const navLinks = document.querySelectorAll(".nav-link");

window.addEventListener("scroll", () => {

    let current = "";

    sections.forEach(section => {

        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;

        if (scrollY >= sectionTop &&
            scrollY < sectionTop + sectionHeight) {

            current = section.id;
        }
    });

    navLinks.forEach(link => {

        link.classList.remove("active");

        if (link.getAttribute("href") === "#" + current) {
            link.classList.add("active");
        }
    });

});


/* image slider background blur */

const page2 = document.querySelector(".page__2");
const slider = document.querySelector(".services__slider");
const images = document.querySelectorAll(".card-image");

if (page2 && slider && images.length > 0) {

    function updateBackground() {

        const currentIndex = Math.round(
            slider.scrollLeft / slider.clientWidth
        );

        page2.style.backgroundImage = `url(${images[currentIndex].src})`;
    }

    updateBackground();

    slider.addEventListener("scroll", updateBackground);
}


/* page3 selection part */

const options = document.querySelectorAll(".option");

if (options.length > 0) {

    let currentIndex = 0;

    options.forEach((option, index) => {
        option.addEventListener("click", () => {
            setActive(index);
        });
    });


    function setActive(index) {
        options.forEach(o => o.classList.remove("active"));
        options[index].classList.add("active");
        currentIndex = index;
    }


   /* setInterval(() => {
        currentIndex = (currentIndex + 1) % options.length;
        setActive(currentIndex);
    }, 5000); */

}


/* ---------- Sidebar & Page Navigation ---------- */

const menuItems = document.querySelectorAll(".menu li[data-page]");
const pages = document.querySelectorAll(".page");

// Function to show a page
function showPage(pageId) {

    // Remove active menu
    menuItems.forEach(menu =>
        menu.classList.remove("active")
    );

    // Hide all pages
    pages.forEach(page =>
        page.classList.remove("active")
    );

    // Activate the correct menu item
    const activeMenu = document.querySelector(
        `.menu li[data-page="${pageId}"]`
    );

    if (activeMenu) {
        activeMenu.classList.add("active");
    }

    // Show the correct page
    const page = document.getElementById(pageId);

    if (page) {
        page.classList.add("active");
    }

}

// Sidebar clicks
menuItems.forEach(item => {

    item.addEventListener("click", (e) => {

        e.preventDefault();

        showPage(item.dataset.page);

    });

});

const retakeBtn = document.getElementById("retakeBtn");

if (retakeBtn) {

    retakeBtn.addEventListener("click", function (e) {

        e.preventDefault();

        sessionStorage.setItem("currentPage", "billing");
        showPage("billing");

    });

}

// Open the saved page after redirect
const savedPage = sessionStorage.getItem("currentPage");

if (savedPage) {

    showPage(savedPage);

    sessionStorage.removeItem("currentPage");

}
else {

    showPage("home");

}


