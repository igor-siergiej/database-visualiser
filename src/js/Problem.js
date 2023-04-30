class Problem {

    createAccordionItem(tableName, title, body,url) {
        // identifier is a randomly generater letter from A-Z to differentiate between 
        // different accordion items and the table where the problem originates from.
        var identifier = tableName + String.fromCharCode(Math.floor(Math.random() * 25) + 65)
        const accordion = document.getElementById("accordion")

        var accordionItem = document.createElement("div")
        accordionItem.className = "accordion-item"

        var accordionHeader = document.createElement("h2")
        accordionHeader.className = "accordion-header"

        var accordionButton = document.createElement("button")
        accordionButton.className = "accordion-button collapsed"
        accordionButton.type = "button"
        accordionButton.setAttribute("data-bs-toggle", "collapse")
        // Identifier here is used to match the header to the button so that only this one expands
        accordionButton.setAttribute("data-bs-target", `#${identifier}`)

        accordionButton.innerHTML = tableName + " - " + title

        var bodyPanel = document.createElement("div")
        bodyPanel.id = identifier
        bodyPanel.className = "accordion-collapse collapse"

        var accordionBody = document.createElement("div")
        accordionBody.className = "accordion-body"
        accordionBody.innerHTML = "To fix this issue, "
        accordionBody.innerHTML += body

        accordionBody.innerHTML += "<br/>"

        accordionBody.innerHTML += "See the "

        var link = document.createElement("a")
        link.innerHTML = "Official PostgreSQL Documentation"
        link.setAttribute("href", url)

        accordionBody.appendChild(link)

        // add htlm link to official postgres documentation

        bodyPanel.appendChild(accordionBody)

        accordionHeader.appendChild(accordionButton)

        accordionItem.appendChild(accordionHeader)
        accordionItem.appendChild(bodyPanel)

        accordion.appendChild(accordionItem)
    }
}

module.exports = Problem