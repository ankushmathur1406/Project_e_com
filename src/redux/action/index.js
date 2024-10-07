//add
export const addCart = (product) =>{
    return {
        type:"ADDITEM",
        payload:product
    }
}

// delete
export const delCart = (product) =>{
    return {
        type:"DELITEM",
        payload:product
    }
}