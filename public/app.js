const wrapper = document.querySelector(".sliderWrapper");
const menuItem = document.querySelectorAll(".menuItem");
const products = [
    {
      id: 1,
      title: "Pepporoni Pizza",
      price: 119,
      colors: [
        {
          img: "pepporoni pizza.png",
        },
      ],
    },
    {
      id: 2,
      title: "Cheese Pizza",
      price: 149,
      colors: [
        {
          img: "Cheese pizza.png",
        },
      ],
    },
    {
      id: 3,
      title: "Hawaian Pizza",
      price: 109,
      colors: [
        {
          img: "hawaian Pizza.png",
        },
      ],
    },
    {
      id: 4,
      title: "Meat Pizza",
      price: 129,
      colors: [
        {
          img: "meaty pizza.png",
        },
      ],
    },
    {
      id: 5,
      title: "Overload Cheese Pizza",
      price: 99,
      colors: [
        {
          img: "overload cheese pizza.png",
        },
      ],
    },
  ];
  
let choosenProduct = products[0];

const currentProductImg = document.querySelector(".productImg");
const currentProductTitle = document.querySelector(".productTitle");
const currentProductPrice = document.querySelector(".productPrice");
const currentProductSizes = document.querySelectorAll(".size");

menuItem.forEach((item, index) => {
    item.addEventListener("click", () => {
        //change the current slide
        wrapper.style.transform = `translateX(${-100 * index}vw)`;
        
        //change the choosen product
        choosenProduct = products[index];

        //change the title 
        currentProductTitle.textContent = choosenProduct.title;

        //change price
        currentProductPrice.textContent = "$" + choosenProduct.price;

        //change image
        currentProductImg.src = choosenProduct.colors[0].img;
    });
});