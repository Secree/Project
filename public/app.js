const wrapper = document.querySelector(".sliderWrapper");
const menuItem = document.querySelectorAll(".menuItem");
const currentProductImg = document.querySelector(".productImg");
const currentProductTitle = document.querySelector(".productTitle");
const currentProductPrice = document.querySelector(".productPrice");
const formItem = document.getElementById("formItem");
const formPrice = document.getElementById("formPrice");
const formImage = document.getElementById("formImage");

// Your products array
const products = [
    {
        id: 1,
        title: "Pepporoni Pizza",
        price: 119,
        colors: [{ img: "pepporoni pizza.png" }]
    },
    {
        id: 2,
        title: "Cheese Pizza",
        price: 149,
        colors: [{ img: "Cheese pizza.png" }]
    },
    {
        id: 3,
        title: "Hawaian Pizza",
        price: 109,
        colors: [{ img: "hawaian Pizza.png" }]
    },
    {
        id: 4,
        title: "Meat Pizza",
        price: 129,
        colors: [{ img: "meaty pizza.png" }]
    },
    {
        id: 5,
        title: "Overload Cheese Pizza",
        price: 99,
        colors: [{ img: "overload cheese pizza.png" }]
    },
];

let choosenProduct = products[0];

// Initialize form with first product
updateFormData(choosenProduct);

menuItem.forEach((item, index) => {
    item.addEventListener("click", () => {
        // Change the current slide
        wrapper.style.transform = `translateX(${-100 * index}vw)`;
        
        // Change the chosen product
        choosenProduct = products[index];

        // Update visible elements
        currentProductTitle.textContent = choosenProduct.title;
        currentProductPrice.textContent = "₱" + choosenProduct.price;
        currentProductImg.src = choosenProduct.colors[0].img;
        
        // Update hidden form fields
        updateFormData(choosenProduct);
    });
});

function updateFormData(product) {
    formItem.value = product.title;
    formPrice.value = product.price;
    formImage.value = product.colors[0].img;
}