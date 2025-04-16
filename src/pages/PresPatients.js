import { useState,useEffect } from "react";




function PrescPatient(){
  const [cartCount, setCartCount] = useState(0);
  const [cartItems, setCartItems] = useState([]);
  const [selectedState, setSelectedState] = useState("");
  const [medicine, setMedicine] = useState({
    name: "",
    description: "",
    timesPerDay: "",
    days: "",
  });

  function addMedicine() {
    if (!medicine.name || !medicine.description || !medicine.timesPerDay || !medicine.days) {
      alert("Please fill in all fields.");
      return;
    }

    const newMedicine = {
      name: medicine.name,
      description: medicine.description,
      timesPerDay: medicine.timesPerDay,
      days: medicine.days,
    };

    setCartItems([...cartItems, newMedicine]);
    setCartCount(cartCount + 1);

    setMedicine({ name: "", description: "", timesPerDay: "", days: "" });
  }

  function removeMedicine(index) {
    const updatedCart = [...cartItems];
    updatedCart.splice(index, 1);
    setCartItems(updatedCart);
    setCartCount(cartCount - 1);
  }
    
       
          const states = [
            "Andaman and Nicobar Islands",
            "Andhra Pradesh",
            "Arunachal Pradesh",
            "Assam",
            "Bihar",
            "Chhattisgarh",
            "Chandigarh",
            "Dadra and Nagar Haveli and Daman and Diu",
            "Delhi",
            "Goa",
            "Gujarat",
            "Haryana",
            "Himachal Pradesh",
            "Jammu and Kashmir",
            "Jharkhand",
            "Karnataka",
            "Kerala",
            "Ladakh",
            "Lakshadweep",
            "Madhya Pradesh",
            "Maharashtra",
            "Manipur",
            "Meghalaya",
            "Mizoram",
            "Nagaland",
            "Odisha",
            "Puducherry",
            "Punjab",
            "Rajasthan",
            "Sikkim",
            "Tamil Nadu",
            "Telangana",
            "Tripura",
            "Uttar Pradesh",
            "Uttarakhand",
            "West Bengal",
          ];

          useEffect(() => {
            const forms = document.querySelectorAll('.needs-validation');
            forms.forEach(form => {
              form.addEventListener('submit', event => {
                if (!form.checkValidity()) {
                  event.preventDefault();
                  event.stopPropagation();
                }
                form.classList.add('was-validated');
              }, false);
            });
        
            // Cleanup function to remove event listeners when component unmounts
            return () => {
              forms.forEach(form => {
                form.removeEventListener('submit', () => {}); 
              });
            };
          }, []);  

    return(
    <div>
      <div className="container">
        
        
      
    

          <div className="jumbotron gradient-background p-4 p-md-5 text-white rounded bg-dark" style={{marginBottom: "32px"}} >
            <div className="col px-0 " style={{color:"black"}}>
              <h1 className="display-4 font-italic" >Patient's Prescription Portal</h1>
            </div>
          </div>
       
            {/* <!--      SIDE_BAR      --> */}

            <div className="row g-5">
              <div className="col-md-5 col-lg-4 order-md-last">
                  <h4 className="d-flex justify-content-between align-items-center mb-3">
                      <span className="text-primary"><span style={{color: "#5aa3e7"}}>Your</span> <span style={{color:" #d73434"}}>Cart</span></span>
                      <span id="cart-count" className="badge bg-primary rounded-pill">0</span>
                  </h4>
          
            {/* <!-- Medicine Prescription Form --> */}
              <div className="card p-3">
                  <h5 className="mb-3">Add Medicine</h5>
                  <input
                type="text"
                className="form-control mb-2"
                placeholder="Medicine Name"
                required
                value={medicine.name}
                onChange={(e) => setMedicine({ ...medicine, name: e.target.value })}
              />
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Brief Description"
                required
                value={medicine.description}
                onChange={(e) => setMedicine({ ...medicine, description: e.target.value })}
              />

                  {/* <input type="text" id="medicine-name" className="form-control mb-2" placeholder="Medicine Name" required/>
                  <input type="text" id="medicine-description" className="form-control mb-2" placeholder="Brief Description" required/>
       */}
                  <div className="row g-2 mb-3">
                      <div className="col">
                      <input
                    type="number"
                    className="form-control"
                    placeholder="Times/Day"
                    min="1"
                    required
                    value={medicine.timesPerDay}
                    onChange={(e) => setMedicine({ ...medicine, timesPerDay: e.target.value })}
                  />
                          {/* <input type="number" id="dosage-per-day" className="form-control" placeholder="Times/Day" min="1" required/> */}
                      </div>
                      <div className="col">
                      <input
                    type="number"
                    className="form-control"
                    placeholder="Days"
                    min="1"
                    required
                    value={medicine.days}
                    onChange={(e) => setMedicine({ ...medicine, days: e.target.value })}
                  />

                          {/* <input type="number" id="duration-days" className="form-control" placeholder="Days" min="1" required/> */}
                      </div>
                  </div>
      
                  <button className="btn btn-primary w-100 gradient-background" onClick={addMedicine}>Add to Cart</button>
              </div>
    
            {/* <!-- Cart List --> */}
            <ul id="cart-list" className="list-group mt-3">
            {cartItems.map((item, index) => (
                <li key={index} className="list-group-item d-flex justify-content-between lh-sm">
                  <div>
                    <h6 className="my-0">{item.name}</h6>
                    <small className="text-body-secondary">
                      {item.description} ({item.timesPerDay}x per day for {item.days} days)
                    </small>
                  </div>
                  <button className="btn btn-sm btn-danger" onClick={() => removeMedicine(index)}>
                    Remove
                  </button>
                </li>
              ))}

                {/* <!-- Medicine items will be dynamically added here --> */}
            </ul>
            <form className="card p-2">
                <label htmlFor="image-upload" className="form-label"><strong>Upload Prescription</strong></label>
                <input type="file" className="form-control mb-2" id="image-upload" accept="image/*" required />
                <button type="button" className="btn btn-primary gradient-bg" id="upload-btn">Upload</button>
              </form>
        </div>
    
    
       
        {/* <!---BILLING ADDRESS--> */}

        <div className="col-md-7 col-lg-8">
        <h4 className="mb-1"><span style={{color: "#5aa3e7"}}>Patient's</span><span style={{color: "#d73434"}} >Address</span></h4>
         <hr/>
            <form className="needs-validation" novalidate="">
                <div className="row g-3">
                  <div className="col-sm-6">
                <label for="firstName" className="form-label">First name *</label>
                <input type="text" className="form-control" id="firstName" placeholder="Enter Your First Name"  required/>
                <div className="invalid-feedback">
                  Valid first name is required.
                </div>
              </div>
  
              <div className="col-sm-6">
                <label for="lastName" className="form-label">Last name *</label>
                <input type="text" className="form-control" id="lastName" placeholder="Enter Your Last Name"  required/>
                <div className="invalid-feedback">
                  Valid last name is required.
                </div>
              </div>
  
              <div className="col-12">
                <label for="username" className="form-label">Username *</label>
                <div className="input-group has-validation">
                  <span className="input-group-text">@</span>
                  <input type="text" className="form-control" id="username" placeholder="Username" required/>
                <div className="invalid-feedback">
                    Your username is required.
                  </div>
                </div>
              </div>
  
              <div className="col-12">
                <label for="email" className="form-label">Email *</label>
                <input type="email" className="form-control" id="email" placeholder="you@example.com" required/>
                <div className="invalid-feedback">
                  Please enter a valid email address for shipping updates.
                </div>
              </div>
  
              <div className="col-12">
                <label for="address" className="form-label">Address *</label>
                <input type="text" className="form-control" id="address" placeholder="1234 Main St" required/>
                <div className="invalid-feedback">
                  Please enter your shipping address.
                </div>
              </div>
  
              <div className="col-12">
                <label for="address2" className="form-label">Address 2 <span className="text-body-secondary">(Optional)</span></label>
                <input type="text" className="form-control" id="address2" placeholder="Apartment or suite"/>
              </div>
  
  
              <div className="col-md-4">
              <label htmlFor="state" className="form-label">
                    State*
                  </label>
                  <select
                    className="form-select"
                    id="state"
                    required
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                  >
                    <option value="">Choose...</option>
                    {states.map((state, index) => (
                      <option key={index} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
              </div>
  
              <div className="col-md-3">
                <label for="zip" className="form-label">Zip *</label>
                <input type="text" className="form-control" id="zip" placeholder="" required/>
                <div className="invalid-feedback">
                  Zip code required.
                </div>
              </div>

            </div>
  
            <hr className="my-4"/>
  
            <div className="form-check">
              <input type="checkbox" className="form-check-input" id="same-address"/>
              <label className="form-check-label" for="same-address">Shipping address is the same as billing address</label>
            </div>
  
            <div className="form-check">
              <input type="checkbox" className="form-check-input" id="save-info"/>
              <label className="form-check-label" for="save-info">Save this information for next time</label>
            </div>
  
            <hr className="my-4"/>
           
            <button className="w-100 btn btn-primary btn-lg gradient-bg" type="submit">Continue to checkout</button>
          </form>
        
        </div>
    
      </div>
      
    </div>

    </div> 

    );
}
export default PrescPatient;