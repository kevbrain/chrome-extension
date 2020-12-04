class Tabext {
    constructor() {
        this.newElement = new CreateElement();
    }

    createTabRule(title,id) {
        //return [this.newElement.create("div",{"id": "tabs", "class": "tab"}, [this.createButton("btntab1")]), 'myButton'];
        var btn = document.createElement("BUTTON");
        btn.classList.add("tablinks");
        btn.innerHTML = title;
        btn.id = id;               
        return btn;
    }


}