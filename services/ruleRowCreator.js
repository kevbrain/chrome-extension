class RuleRowCreator {
    constructor() {
        this.newElement = new CreateElement();
    }

    createRow(ruleData) {
        if (ruleData === undefined) {
            ruleData = {};
            ruleData.id = `r${Date.now()}`;
            ruleData.actived = false;
           
            //ruleData.matchType = "overrideRequest";
            ruleData.requestRegex = "/namespaces/{}";
            ruleData.origin = "https://console-openshift-console.apps.ksr.clusters.its4u.eu";
        }

        console.log(ruleData);

        // Faudra binder les élements aussi

        return [this.newElement.create("div",{"id": ruleData.id, "class": "rule"}, [this.ruleActionsEl(ruleData), this.ruleContentEl(ruleData)]), ruleData.id];
    }

    ruleActionsEl(ruleData) {
        // a
        const imgDeleteEl = this.newElement.create('img',{"data-ruleid": `${ruleData.id}`, "class": "icon-16px", "src": "../assets/img/delete.svg", "alt": "Add rule"});
        const aDeleteEl = this.newElement.create('a', {"id": `${ruleData.id}_rule--delete`,"data-ruleid": `${ruleData.id}`, "href": "#", "class": "rule--delete"}, [imgDeleteEl]);

        //Label + input
        let inputRuleActivateEl = this.newElement.create('input', {'id': `${ruleData.id}_rule--activate`, "class": "rule--activate", "type":"checkbox"});
        if (ruleData.actived) {
            inputRuleActivateEl.checked = true;
        }
        const labelRuleActivateEl = this.newElement.create('label', {'for': `${ruleData.id}_rule--activate`}, ["Active rule ", inputRuleActivateEl]);

        // rule__action
        return this.newElement.create("div", {"class": "rule__actions"}, [labelRuleActivateEl, aDeleteEl]);
    }

    ruleContentEl(ruleData) {

        //Label origin url
        const inputRuleorigin = this.newElement.create('input', {'id': `${ruleData.id}_rule--origin`, "class": "rule--origin","type":"text", "value": `${ruleData.origin}`});
        const labelRuleorigin = this.newElement.create('label', {'for': `${ruleData.id}_rule--origin`}, ["Origin page"]);
        const rulePagesEl = this.newElement.create('div', {id:`${ruleData.id}_rule--rulePage`, class: 'rule__content__item' }, [labelRuleorigin, inputRuleorigin])


        //Label Key Group search path method + select + options
        const option1matchType = this.newElement.create('option', {'value': 'contains'}, 'Contains');
        const option2matchType = this.newElement.create('option', {'value': 'startWith'}, 'Start with');
        const selectmatchType = this.newElement.create('select', {'id': `${ruleData.id}_rule--matchType`, "class": "rule--matchType"}, [option1matchType, option2matchType]);
        selectmatchType.value = ruleData.matchType;
        const labelmatchType = this.newElement.create('label', {'for': `${ruleData.id}_rule--matchTypeLabel`},  "Key Group search path method");
        const matchTypeEl = this.newElement.create('div', {id:`${ruleData.id}_rule--matchType`, class: 'rule__content__item' }, [labelmatchType, selectmatchType])
        
        
        //Label request path + input
        const inputRuleRequestRegex = this.newElement.create('input', {'id': `${ruleData.id}_rule--requestRegex`, "class": "rule--requestRegex", "type":"text", "value": `${ruleData.requestRegex}`});
        const labelRuleRequestRegex = this.newElement.create('label', {'for': `${ruleData.id}_rule--requestRegex`}, ["Path with key group {}"]);
        const requestRegexEl = this.newElement.create('div', {id:`${ruleData.id}_rule--ruleRequest`, class: 'rule__content__item' }, [labelRuleRequestRegex, inputRuleRequestRegex])

        // if(ruleData.matchType === "injectCode") {
        //     // Hide regex Input if user selected InjectCode
        //     labelRuleRequestRegex.style.display = 'none';
        // }

        //Label localhost URL + input
        // const inputRuleLocalhostUrl = this.newElement.create('input', {'id': `${ruleData.id}_rule--localhostUrl`, "class": "rule--localhostUrl", "type":"text", "value": `${ruleData.localhostUrl}`});
        // const labelRuleLocalhostUrl = this.newElement.create('label', {'for': `${ruleData.id}_rule--localhostUrl`}, ["URL to inject", inputRuleLocalhostUrl]);
        // const localhostUrlEl = this.newElement.create('div', {id:`${ruleData.id}_rule--localhostUrl`, class: 'rule__content__item' }, [labelRuleLocalhostUrl, inputRuleLocalhostUrl])


        return this.newElement.create("div", {"class": "rule__content"}, [rulePagesEl,matchTypeEl,  requestRegexEl]);
    }


}