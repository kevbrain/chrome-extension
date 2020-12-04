class App {
    constructor() {
        
        this.ui = new Ui();
        this.messenger = new Messenger();
        this.store = new Store();        
        this.addRulesBtnEl = document.querySelector('#btn__addRules');

        this.init();
    }

    async init () {
        try {
            
            //this.bindSwitchActiveExtension();
            this.ui.insertTabs();
            this.bindListenerToButtonTab('rules');
            this.bindListenerToButtonTab('windows');
            this.bindListenerToButtonTab('webRequests');

            document.querySelector(`#tab_rules`).click();
            this.bindAddRuleBtn();
            /*
             * Check which data in chrome sync, see if we can display some stuff
             */
            await this.store.get(["requestoverrideWatch", "requestoverrideRules"]);
            this.restoreData();
            // console.log('app -> init -> store.dataInStorage');
            // console.log(this.store.dataInStorage);
        } catch (err) {
            console.warn(`Error: ${err}`);
            console.warn(`Error: Try restarting the app`);
        }
    }

    bindListenerToButtonTab(tabName) {
        document.querySelector(`#tab_${tabName}`).addEventListener('click', () => {
            var i, tabcontent, tablinks;

            // Get all elements with class="tabcontent" and hide them
            tabcontent = document.getElementsByClassName("tabcontent");
            for (i = 0; i < tabcontent.length; i++) {
              tabcontent[i].style.display = "none";
            }
          
            // Get all elements with class="tablinks" and remove the class "active"
            tablinks = document.getElementsByClassName("tablinks");
            for (i = 0; i < tablinks.length; i++) {
              tablinks[i].className = tablinks[i].className.replace(" active", "");
              tablinks[i].style.background = "#f1f1f1";
              tablinks[i].style.color = "black";
            }
          
            // Show the current tab, and add an "active" class to the button that opened the tab
            document.getElementById(tabName).style.display = "block";
            document.querySelector(`#tab_${tabName}`).style.background = "#702F8A";
            document.querySelector(`#tab_${tabName}`).style.color = "white";
            evt.currentTarget.className += " active";    
        });
    }

    restoreData() {
        let data = this.store.dataInStorage;

        // Check if property exists and is equal to true
        // If so, we trigger click on checkbox
        if (data.hasOwnProperty("requestoverrideWatch") && data.requestoverrideWatch) {
            // this.switchActiveExtensionBtnEl.click();
            this.ui.toggleHeaderActive(data.requestoverrideWatch);
            this.messenger.sendMessage({payload: this.store.dataInStorage});
            document.querySelector('#switchActiveExtension').checked = true;
        }

        // console.log('tesot', data.hasOwnProperty('requestoverrideRules'), data.requestoverrideRules);
        if (data.hasOwnProperty('requestoverrideRules')) {
            const rulesToRestore = data.requestoverrideRules;
            rulesToRestore.forEach((rule) => {
                const rowID = this.ui.insertRuleRow(rule);  // insert row and get ID in return
                this.bindRowListeners(rowID);
            })
        }

    }

    updateData() {
        //const appStatus = this.switchActiveExtensionBtnEl.checked;
        const ruleEls = document.querySelectorAll('.rule');
        let rulesData = [];


        ruleEls.forEach((ruleEl) => {
            let ruleData = {};
            ruleData.id = ruleEl.id;
            ruleData.actived = ruleEl.querySelector('.rule--activate').checked;
            // console.log('LILO');
            // console.log(ruleData.actived);
            ruleData.matchType = ruleEl.querySelector('.rule--matchType').value;
            // console.log('josé :', ruleData.matchType );
            ruleData.origin = ruleEl.querySelector('.rule--origin').value;
            ruleData.requestRegex = ruleEl.querySelector('.rule--requestRegex').value;
            //ruleData.localhostUrl = ruleEl.querySelector('.rule--localhostUrl').value;

            rulesData.unshift(ruleData);
        });

        //this.store.dataInStorage = {requestoverrideRules: rulesData, requestoverrideWatch: appStatus};
        this.store.dataInStorage = {requestoverrideRules: rulesData};
        this.store.set(this.store.dataInStorage);
        this.messenger.sendMessage({payload: this.store.dataInStorage});
    }

    toggleSwitchActiveExtension(status) {
        this.ui.toggleHeaderActive(status);
        // this.store.set({requestoverrideWatch: status});
        this.store.dataInStorage.requestoverrideWatch = status;
        this.updateData();
    }

    bindAddRuleBtn () {
        
        this.addRulesBtnEl.addEventListener('click', () => {
            const rowID = this.ui.insertRuleRow(); // insert row and get ID in return
            this.bindRowListeners(rowID);

        })
        
    }


    // bindSwitchActiveExtension () {
    //     this.switchActiveExtensionBtnEl.addEventListener('click', (e) => {
    //         this.toggleSwitchActiveExtension(e.target.checked);
    //     })
    // }s

    bindRowListeners(id) {
        // Active
        document.querySelector(`#${id}_rule--activate`).addEventListener('click', () => {
            console.log('Active or not');
            this.updateData();
        });

        // Injection Choice
        document.querySelector(`#${id}_rule--matchType`).addEventListener('change', (e) => {
            const thisLabel = document.querySelector(`label[for="${id}_rule--requestRegex"]`);
            if(e.target.value === "injectCode") {
                thisLabel.style.display = 'none';
            } else {
                thisLabel.style.display = 'flex';                
            }
            this.updateData();
        });

        // Delete
        document.querySelector(`#${id} .rule--delete`).addEventListener('click', (e) => {
            console.log(e.target.dataset.ruleid);
            console.log('Deletion');
            const idToDelete = e.target.dataset.ruleid;
            document.querySelector(`#${idToDelete}`).remove();
            this.updateData();
        });

        // A/B Test Regex
        document.querySelector(`#${id}_rule--origin`).addEventListener('keyup', () => {
            console.log('ab change');
            this.updateData();
        });
        
        // Request Regex
        document.querySelector(`#${id}_rule--requestRegex`).addEventListener('keyup', () => {
            console.log('request change');
            this.updateData();
        });
        
        // Localhost URL
        // document.querySelector(`#${id}_rule--localhostUrl`).addEventListener('keyup', () => {
        //     console.log('localhost change');
        //     this.updateData();            
        // });
    }
}