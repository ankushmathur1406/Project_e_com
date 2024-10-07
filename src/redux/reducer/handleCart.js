
const getInitialCart = () => {
  const storedCart = localStorage.getItem("cart");
  return storedCart ? JSON.parse(storedCart) : [];
};

//above getting initial state of local storage.

const handleCart = (state = getInitialCart(), action) => {
  const product = action.payload;
  let updatedCart;

  switch (action.type) {
    case "ADDITEM":
    
      const exist = state.find((x) => x.id === product.id); //checked if cart me hai ya nhi.
      if (exist) {
        updatedCart = state.map((x) =>
          x.id === product.id ? { ...x, qty: x.qty + 1 } : x //if hai then increasing qty.
        );
      } else {
        updatedCart = [...state, { ...product, qty: 1 }];
      }

      localStorage.setItem("cart", JSON.stringify(updatedCart)); //updating ls
      return updatedCart;

    case "DELITEM":
      const exist2 = state.find((x) => x.id === product.id);
      if (exist2.qty === 1) {
        updatedCart = state.filter((x) => x.id !== exist2.id);
      } else {
        updatedCart = state.map((x) =>
          x.id === product.id ? { ...x, qty: x.qty - 1 } : x
        );
      }

      localStorage.setItem("cart", JSON.stringify(updatedCart)); 
      return updatedCart;

    default:
      return state;
  }
};

export default handleCart;
