class Ui {
    constructor() {
        this.newElement = new CreateElement();
        this.tabsext = new Tabext();
        this.ruleRowCreator = new RuleRowCreator();        
        this.mainEl = document.querySelector('main');


    }

    toggleHeaderActive(status) {
        const headerEl = document.querySelector('header');
        if ( status ) {
            headerEl.classList.add('header--extensionActive');
            chrome.browserAction.setIcon({path: './assets/img/active.png'});
        } else {
            headerEl.classList.remove('header--extensionActive');
            chrome.browserAction.setIcon({path: './assets/img/normal.png'});
        }
    }

    insertRuleRow(ruleData) {
        console.log('insert rule');
        const getRowEl = this.ruleRowCreator.createRow(ruleData); // return [el, id]
        this.mainEl.insertAdjacentElement('beforeend', getRowEl[0]);
        return getRowEl[1]; // Returning ID of row
    }

    insertTabs() {
        var element= document.getElementById("tab1");
        element.insertAdjacentElement('afterbegin',this.tabsext.createTabRule("Follow Web Requests","tab_webRequests"));        
        element.insertAdjacentElement('afterbegin',this.tabsext.createTabRule("Active Windows","tab_windows"));
        element.insertAdjacentElement('afterbegin',this.tabsext.createTabRule("Rules Definition","tab_rules"));
       
    }


}
