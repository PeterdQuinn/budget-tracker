
let db;
const request = indexedDB.open('budget_tracker', 1);
request.onupgradeneeded = function(event) {
    const db = event.target.result; 
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

request.onsuccess = function(event) {
    // when db is successfully created with its object store (from onupgradeneeded event above) or simply established a connection, save reference to db in global variable
    db = event.target.result;
  
    //check if app is online, if yes, run uploadTransaction() function to send all local db data to api
    if(navigator.onLine) {
        //we haven't created this yet
        uploadTransaction();
    }
};

request.onerror = function(event) {
    console.log(event.target.errorCode);
}



function saveRecord(record) {
    
    const transaction = db.transaction(['new_transaction'], 'readwrite');
    const transactionObjectStore = transaction.objectStore('new_transaction');
    transactionObjectStore.add(record);
}


function uploadTransaction() {
  
    const transaction = db.transaction(['new_transaction'], 'readwrite');

    const transactionObjectStore = transaction.objectStore('new_transaction');

    const getAll = transactionObjectStore.getAll();

    getAll.onsuccess = function() {
        
        if(getAll.result.length > 0) {
            fetch('/api/transaction', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type' : 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
                if(serverResponse.message) {
                    throw new Error(serverResponse)
                }

                const transaction = db.transaction(['new_transaction'], 'readwrite');
                const transactionObjectStore = transaction.objectStore('new_transaction');
                transactionObjectStore.clear();

                alert('All saved transaction has been submitted!');


            })
            .catch(err => {
                console.log(err)
            })
        }
    }

}

window.addEventListener('online', uploadTransaction);