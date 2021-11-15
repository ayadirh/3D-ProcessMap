define(['require', 'd3'], function (require, d3) {
    // No longer used
    function readData() {
        var givenData = d3.select("pre#example1").text();
        // console.log('esse: ', givenData);
    
        //Excerpt from Bootstrap example on Form validation
        // Fetch all the forms we want to apply custom Bootstrap validation styles to
        var forms = document.querySelectorAll('.needs-validation')
        var csv;
        //var givenData = d3.select("pre#example1").text();
        // Loop over them and prevent submission
        Array.prototype.slice.call(forms)
            .forEach(function (form) {
                form.addEventListener('submit', function (event) {
                    if (!form.checkValidity()) {
                        event.preventDefault()
                        event.stopPropagation()
                    } else {
                        event.preventDefault()
                    }
                    form.classList.add('was-validated')
                }, false)
            })
    
        //console.log(document.forms);
        document.forms['formVisualize'].onsubmit = function (event) {
            if (this.checkValidity()) {
                const selectedFile = document.getElementById('eventlogs').files[0];            
                let reader = new FileReader();
                reader.onload = function (e) {
                    let contents = e.target.result;
                    csv = parseContents(contents);
                    // csv.forEach(element => {
                    //     console.log('X:', element);
                    //   })  
                    //console.log(csv);
                };
                reader.readAsText(selectedFile);
            }
            function parseContents(contents) {
                let element = document.getElementById('file-content');
                element.textContent = contents;
                return d3.csv.parse(contents);
              }
        }
        return {
            givenData: givenData,
            csv: csv
        };
    }
    return {
        readData: readData
    };
});