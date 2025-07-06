/*
 * Obtencion de archivos JS de manera paralela y carga sincronica
 */
//loadjs(['https://kit.fontawesome.com/bf671ef02a.js', 'https://cdnjs.cloudflare.com/ajax/libs/d3/4.13.0/d3.min.js', '/js/ramos.js', '/js/canvas.js'], 'init');
/*loadjs.ready('init', {
    success: function() { console.log("Recursos cargados") },
    error: function(depsNotFound) {
        Swal.fire(
            "Fallo al cargar",
            "Tuvimos problemas al cargar algunas dependencias... el sitio se recargara en 5 segundos.",
            "error"
        );
        setTimeout(function(){
            location.reload();
        }, 5000);
    },
});*/



let vh = window.innerHeight * 0.01;
// Then we set the value in the --vh custom property to the root of the document
document.documentElement.style.setProperty('--vh', `${vh}px`);
window.addEventListener('resize', () => {
    // We execute the same script as before
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
});

function render(props) {
    return function(tok, i) {
        return (i % 2) ? props[tok] : tok;
    };
}
let relaPath = './'
let prioridad = document.URL.includes('prioridad')
let personalizar = document.URL.includes('personalizar')
let mallaPersonal = document.URL.includes("malla.")
let contact = document.URL.includes("contact")
let fullCareerName = ""
let texts = "Malla"
if (mallaPersonal)
    texts = "Personal"
else if (prioridad)
    texts = "Prioridad"
else if (personalizar)
    texts = "Generadora"

if (texts !== "Malla" || contact) {
    relaPath = '../'
}
// Disabled due to safari bug
/*if ('serviceWorker' in navigator) {
    console.log("Service worker compatible")
    window.addEventListener('load', function() {
        navigator.serviceWorker.register(relaPath + 'serviceWorker.js').then(function(registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}*/

let params = new URLSearchParams(window.location.search)

let carr = localStorage.getItem("currentCarreer")

if (params.get('m')) {
    carr = params.get('m')
    localStorage.setItem("currentCarreer", carr)
}

// update the url for feedback
if (carr) {
    let url = new URL(window.location.href)
    url.searchParams.set('m', carr)
    window.history.pushState({}, '', url);
}


if (!carr)
    carr = 'INF'

let sct = true
if (params.get('SCT') === "false")
    sct = false

// document.addEventListener("DOMContentLoaded", loadViews)
//
// window.addEventListener("load", function () {console.log("load")})
// function loadViews() {
    console.log("dom")
    // obtener vistas
    let includes = document.querySelectorAll('[data-include]')
    let promises = []
    let welcomeTexts = {}
    includes.forEach(include => {
        let fileURL = relaPath + 'views/' + include.attributes['data-include'].nodeValue + '.html';
        promises.push(fetch(fileURL).then(response => response.text())
            .then(data => {
                include.insertAdjacentHTML("afterbegin", data)
            }))
    })
    let fileURL = relaPath + "data/welcomeTexts.json"
    promises.push(fetch(fileURL).then(response => response.json()))
    Promise.all(promises)
        .then( () => {
            return fetch(new Request(relaPath + "date.txt"))
        }).then(response => {
            console.log(response)
            let lastModified = response.headers.get("last-modified")
            let date = new Date(lastModified)
            console.log(date)
            document.getElementById("lastUpdate").textContent = date.toLocaleString()
        })
    Promise.all(promises).then((datas) => {
        welcomeTexts = datas.pop()[texts]

        let home = document.getElementById("goToHome")
        let calculator = document.getElementById("goToCalculator")
        let generator = document.getElementById("goToGenerator")
        let goToContact = document.getElementById("contact")
        if (!mallaPersonal) {
            if (!prioridad)
                calculator.setAttribute("href", relaPath + 'prioridad/?m=' + carr)
            else
                calculator.classList.add("active")
            if (!personalizar)
                generator.setAttribute("href", relaPath + 'personalizar/?m=' + carr)
            else {
                generator.classList.add("active")
                document.getElementById("generate").setAttribute("href", "./malla.html?m=" + carr)
            }
        } else
            generator.setAttribute("href", relaPath + 'personalizar/?m=' + carr)
        if (contact)
            goToContact.classList.add("active")
        goToContact.setAttribute("href", relaPath + "contact/")
        home.setAttribute("href", relaPath + '?m=' + carr)
        return fetch(relaPath + '/data/carreras.json')
    }).then(response => response.json()).then((careers,) => {
        //if (!mallaPersonal) {
            let tabTpl1 = document.querySelector('script[data-template="tab-template1"]').text.split(/\${(.+?)}/g);
            let tabTpl2 = document.querySelector('script[data-template="tab-template2"]').text.split(/\${(.+?)}/g);
            if (contact) {
                document.querySelectorAll(".carrers").forEach(element => element.remove())
            }

            careers.forEach(career => {
                if (career['Link'] === carr) {
                    fullCareerName = career["Nombre"]
                    welcomeTexts["welcomeTitle"] = welcomeTexts["welcomeTitle"].replace("CARRERA", career['Nombre'])
                    $('.carrera').text(career['Nombre'])
                    if (mallaPersonal) {
                     let title = document.title
                     document.title = title + " basada en " + career['Nombre']
                    } else {
                        let title = document.title.slice(0, 17)
                        title += " " + career['Nombre']
                        title += document.title.slice(17)
                        document.title = title
                    }
                }
            });
            $('#carreras1-nav').append(careers.map(function (values) {
                return tabTpl1.map(render(values)).join('');
            }));
            $('#carreras2-nav').append(careers.map(function (values) {
                return tabTpl2.map(render(values)).join('');
            }));
            if ( document.querySelector(".overlay-content h1")){
            document.querySelector(".overlay-content h1").textContent = welcomeTexts["welcomeTitle"]
            document.querySelector(".overlay-content h5").textContent = welcomeTexts["welcomeDesc"]
        }
    })
// }

function removePopUp() {
    d3.select("body").style("overflow", "initial")
    d3.selectAll(".overlay").style("-webkit-backdrop-filter", "blur(0px) contrast(100%)");
    d3.selectAll(".overlay").style("backdrop-filter", "blur(0px) contrast(100%)");
    d3.select(".overlay-content").transition().style("filter", "opacity(0)")
    d3.select(".overlay").transition().style("filter", "opacity(0)").on('end', function() {
        d3.select(this).remove();
    })
}

  $(function () {
      if (contact)
          return

      if (sct) {
          document.getElementById("creditsExample").textContent = "Créditos SCT";
          let credit = parseInt(document.getElementById("creditsNumberExample").textContent);
          document.getElementById("creditsNumberExample").textContent = (Math.round(credit * 5 / 3)).toString()
      }


      let malla = null
      let semesterManager = null
      if (prioridad) {
          malla = new Malla(sct, SelectableRamo, 0.804, 1)
          malla.enableCreditsSystem()
          document.getElementById("custom-credits-USM").addEventListener("input", function updateSCTPlaceholder() {
              if (this.value == "")
                  document.getElementById("custom-credits-SCT").setAttribute("placeholder", "Ingrese un valor")
              else
                  document.getElementById("custom-credits-SCT").setAttribute("placeholder", Math.round(this.value * 5/3).toString())
          })

      } else if (personalizar && !mallaPersonal) {
          malla = new Malla(sct, SelectableRamo, 0.804, 1)
          malla.enableCreditsSystem()
          document.getElementById("custom-credits-USM").addEventListener("input", function updateSCTPlaceholder() {
              if (this.value == "")
                  document.getElementById("custom-credits-SCT").setAttribute("placeholder", "Ingrese un valor")
              else
                document.getElementById("custom-credits-SCT").setAttribute("placeholder", Math.round(this.value * 5/3).toString())
          })
          document.getElementById("custom-creditsa-USM").addEventListener("input", function updateSCTPlaceholder() {
              if (this.value == "")
                  document.getElementById("custom-creditsa-SCT").setAttribute("placeholder", "Ingrese un valor")
              else
                  document.getElementById("custom-creditsa-SCT").setAttribute("placeholder", Math.round(this.value * 5/3).toString())
          })


          //document.getElementById("#reset").addEventListener("click", () => malla.semesterManager.cleanSemester())
          //document.getElementById("#resetc").addEventListener("click", () => malla.semesterManager.cleanAll())
      } else  if (mallaPersonal) {
          malla = new CustomMalla(sct)
          document.getElementById("cleanApprovedButton").addEventListener("click",() => malla.cleanSubjects())
          malla.enableCreditsStats()
          malla.enableCreditsSystem()
      } else {
          malla = new Malla(sct);
          malla.enableCreditsStats()
          malla.enableCreditsSystem()
          malla.enableSave()
          document.getElementById("cleanApprovedButton").addEventListener("click", () => malla.cleanSubjects())

      }

      let drawnMalla = malla.setCareer(carr, fullCareerName, relaPath).then((val) => {
          return malla.drawMalla(".canvas")
      });
      drawnMalla.then(() => {
          malla.updateStats()
          malla.displayCreditSystem()
          malla.showColorDescriptions(".color-description")
          document.getElementById("overlay").addEventListener("click", () => {
              if (prioridad || personalizar && !mallaPersonal) {
                  malla.semesterManager.loadSemesters()
              } else
                  malla.loadApproved()
              malla.enablePrerCheck()
          })
      })
      drawnMalla.then(() => {
          if (prioridad){
              semesterManager = new Priorix(malla, "#priorix")
              semesterManager.subjectsInManySemesters = true
              semesterManager.mallaEditor.loadSubjects()
          }
          else if (personalizar && !mallaPersonal) {
              semesterManager = new Generator(malla, "#priorix")
              semesterManager.mallaEditor.loadSubjects()
              semesterManager.mallaEditor.loadCategories()
          }
          malla.setSemesterManager(semesterManager)
          malla.generateCode()


      })
  });

function changeCreditsSystem() {
    let key = 'SCT'
    let value = 'false'
    const params = new URLSearchParams(window.location.search);
    if (params.has(key)) {
        value = !('true' === params.get(key))
    }
    key = encodeURI(key); value = encodeURI(value);
    var kvp = document.location.search.substr(1).split('&');

    var i=kvp.length; var x; while(i--)
{
    x = kvp[i].split('=');

    if (x[0]===key)
    {
        x[1] = value;
        kvp[i] = x.join('=');
        break;
    }
}

    if(i<0) {kvp[kvp.length] = [key,value].join('=');}

    //this will reload the page, it's likely better to store this until finished
    document.location.search = kvp.join('&');
}
// Futuro remplazo de canvas.js

class Malla {

    constructor(sct = false, subjectType = Ramo, scaleX = 1, scaleY = 1) {

        // Propiedades antes del render
        this.scaleX = scaleX;
        this.scaleY = scaleY;
        this.subjectType = subjectType;
        this.rawMalla = {};
        this.categories = {};
        this.malla = {};
        this.sct = sct;
        this.longestSemester = 0;
        this.totalCredits = 0;
        this.totalSubjects = 0;
        this.semesterManager = null
        this.currentMalla = null;
        this.generatedCode = []

        // Propiedades despues del render
        this.APPROVED = [];
        this.SUBJECTID = 1;
        this.ALLSUBJECTS = {};
        this.checkPrer = false;
        this.saveEnabled = false;
        this.isMallaSet = false;
        this.showCreditSystem = false;
        this.showCreditStats = false

        this.totalCredits = 0;
        this.totalSubjects = 0;

        if (document.getElementById("loadfile")) {
            document.getElementById("loadfile").addEventListener("click", this.loadFile.bind(this))
        }

    }

    // Se explica solo
    enableCreditsStats() {
        this.showCreditStats = true
    }

    // Se explica solo
    enableCreditsSystem() {
        this.showCreditSystem = true
    }

    // Habilita el guardado de ramos aprobados para futuras sesiones
    enableSave() {
        this.saveEnabled = true
    }

    // Obtiene los datos de la carrera y retorna una promesa para cuando los datos se hayan conseguido y
    // las propiedades estén listas
    setCareer(carr, fullCareerName, relaPath) {
        if (localStorage["sharedMalla"] != undefined) {
            let unparsedData = localStorage["sharedMalla"]
            localStorage.removeItem("sharedMalla")
            let data = JSON.parse(unparsedData)
            this.currentMalla = data.name;
            this.fullCareerName = data.name
            console.log("hola")
            console.log(data.name)
            return Promise.resolve(this.setMallaAndCategories(data.malla, data.categories))

        } else {
            this.currentMalla = carr;
            this.fullCareerName = fullCareerName
            let promises = [];
    
            promises.push(d3.json( relaPath + "data/data_" + this.currentMalla + ".json"));
            promises.push(d3.json( relaPath + "data/colors_" + this.currentMalla + ".json"));
            return Promise.all(promises).then(values => {this.setMallaAndCategories(values[0], values[1])})

        }
    }

    // Define los datos de la malla y propiedades
    setMallaAndCategories(malla, categories) {
        let semester;
        let longest_semester = 0;
        let totalCredits = 0;
        let totalRamos = 0;

        this.rawMalla = malla;
        this.categories = categories;

        for (semester in this.rawMalla) {
            this.malla[semester] = {};

            if (malla[semester].length > longest_semester)
                longest_semester = malla[semester].length;
            malla[semester].forEach(subject => {
                // Se instancia el ramo y se agrega a la malla en su semestre
                totalRamos += 1;
                // Agregado de ramos por semestre
                if (subject.length === 7) {
                    // Nuevo formato con ramos SCT
                    this.malla[semester][subject[1]] = new this.subjectType(subject[0], subject[1], subject[2], subject[4], subject[5],this.SUBJECTID++, this, subject[3], false ,subject[6])
                } else {
                    // Formato antiguo
                    this.malla[semester][subject[1]] = new this.subjectType(subject[0], subject[1], subject[2], subject[3], (function hasPrer() {
                        if (subject.length > 4) {
                            return subject[4];
                        }
                        return [];
                    })(), this.SUBJECTID++, this);
                }
                // Se agrega el ramo a la lista de asignaturas
                this.ALLSUBJECTS[subject[1]] = this.malla[semester][subject[1]];
                totalCredits += this.malla[semester][subject[1]].getDisplayCredits()
            });
        }
        this.longestSemester = longest_semester;
        this.totalCredits = totalCredits;
        this.totalSubjects = totalRamos;
        this.isMallaSet = true;
    }

    // Define el controlador de semestres para que las asignaturas puedan acceder a el
    setSemesterManager(semesterManager) {
        this.semesterManager = semesterManager
    }

    // Agrega ramos a la malla
    addSubject(subject) {
        this.ALLSUBJECTS[subject.sigla] = subject
    }

    // Elimina ramos de la malla y todo rastro de ellos
    delSubjects(subject) {
        Object.values(this.ALLSUBJECTS).forEach(otherSubject => {
            // Elimina el ramo como prerrequisito de otros
            if (otherSubject.prer.has(subject.sigla)){
                otherSubject.prer.delete(subject.sigla)
                otherSubject.verifyPrer()
            }
        })
        delete this.ALLSUBJECTS[subject.sigla]
    }

    // Renderiza la malla. canvasId puede ser una clase o una id
    drawMalla(canvasId) {

        if (!this.isMallaSet)
            return;

        let separator = 10;
        let semesterIndicatorHeight = 30 * this.scaleY;
        // Se define el tamaño
        let width = (this.subjectType.getDisplayWidth(this.scaleX) * Object.keys(this.malla).length) +
            separator * (Object.keys(this.malla).length - 1);
        let height = (this.subjectType.getDisplayHeight(this.scaleY) + separator) * this.longestSemester +
            semesterIndicatorHeight * 2 + separator;
        let canvasWidth = width + separator; // for full show svg
        let canvasHeight = height + separator/2

        const canvas = d3.select(canvasId).append("svg")
            .attr("width", canvasWidth)
            .attr("height", canvasHeight)
            .attr("role", "figure");

        canvas.append("title")
            .text("Malla " + this.fullCareerName)

        const drawer = canvas;
        let globalX = separator / 2,
            globalY = 0;
        let isBigBarRendered = false;
        let semestersPassed = 0;
        let currentYear = 0;
        let currentYearIndicator = null;
        let currentYearIndicatorText = null;
        let yearIndicator = null;

        Object.keys(this.malla).forEach(semester => {
            globalY = 0;
            // Barra indicadora de años
            if (semestersPassed === 0) {
                yearIndicator = drawer.append("g")
                    .attr("cursor", "pointer")
                    .attr("role", "heading")
                    .attr("aria-level", "5")
                    .classed("year", true);
                // se crea la barra en caso de semestre impar
                let desc = yearIndicator.append("title")
                // rectangulo de la barra
                currentYearIndicator = yearIndicator.append("rect")
                    .attr("x", globalX)
                    .attr("y", globalY)
                    .attr("width", this.subjectType.getDisplayWidth(this.scaleX))
                    .attr("height", semesterIndicatorHeight)
                    .attr("fill", 'gray')
                    .classed('bars', true);
                semestersPassed++;
                // texto de la barra
                currentYearIndicatorText = yearIndicator.append("text")
                    .attr('x', globalX + this.subjectType.getDisplayWidth(this.scaleX) / 2.0)
                    .attr('y', globalY + semesterIndicatorHeight / 2)
                    .text("Año " + currentYear++ + " 1/2")
                    // .attr("font-family", "sans-serif")
                    .attr("font-weight", "bold")
                    .attr("fill", "white")
                    .attr("dominant-baseline", "central")
                    .attr('text-anchor', 'middle');
                desc.text("Año " + currentYear + " 1/2")
                // Evento en caso de hacer click en el
                yearIndicator.on("click", () => {
                    let bar = d3.select(d3.event.currentTarget)
                    let number = parseInt(bar.select("text").text().substr(4));
                    let ramosToSelect;
                if (bar.node().getBBox().width <= this.subjectType.getDisplayWidth(this.scaleX) * 2 - this.subjectType.getDisplayWidth(this.scaleX) / 2) {
                    d3.select("#sem" + (number * 2 + 1)).dispatch('click')
                } else {
                    d3.select("#sem" + number * 2).dispatch('click');
                    d3.select("#sem" + (number * 2 - 1)).dispatch('click')

                }

                });
            } else {
                // si es par, la actual se expande
                currentYearIndicator.attr("width", this.subjectType.getDisplayWidth(this.scaleX) * 2 + separator);
                currentYearIndicatorText.text("Año " + (currentYear));
                currentYearIndicatorText.attr("x", globalX - separator / 2);
                semestersPassed = 0;
                yearIndicator.select("title").text("Año "+ (currentYear))
            }

            globalY += semesterIndicatorHeight + separator;

            // Barra gigante de semestres
            if (!isBigBarRendered) {
                // Se crea la barra
                drawer.append("rect")
                    .attr("x", globalX)
                    .attr("y", globalY)
                    .attr("width", width)
                    .attr("height", semesterIndicatorHeight)
                    .attr("fill", '#EEE')
                    .classed("sem", true);
                isBigBarRendered = true;
            }

            // Pequeño seteo de variables en caso de que semestre sea "S1" o 1 por ejemplo
            let intToRomanize = semester
            if (intToRomanize[0] === "s") {
                intToRomanize = parseInt(intToRomanize.substr(1))
            } else {
                intToRomanize = parseInt(intToRomanize)
            }

            // barra de semestres individuales
            let semesterIndicator = drawer.append("g")
                .attr("id", "sem" + intToRomanize)
                .attr("cursor", "pointer")
                .attr("width", this.subjectType.getDisplayWidth(this.scaleX))
                .attr("height", semesterIndicatorHeight)
                .attr("role", "heading")
                .attr("aria-level", "6")
                .classed("sem", true);

            semesterIndicator.append("title").text("Semestre " + intToRomanize)



            semesterIndicator.append("rect")
                .attr("cursor", "pointer")
                .attr("x", globalX)
                .attr("y", globalY)
                .attr("width", this.subjectType.getDisplayWidth(this.scaleX))
                .attr("height", semesterIndicatorHeight)
                .classed("sem", true)
                .attr("fill", '#EEE');


            semesterIndicator.append("text")
                .attr('x', globalX + this.subjectType.getDisplayWidth(this.scaleX) / 2.0)
                .attr('y', globalY + semesterIndicatorHeight / 2)
                .text(this.romanize(intToRomanize))
                .attr("dominant-baseline", "central")
                .attr('text-anchor', 'middle');
            // evento en caso de clickear la barra del semestre
            semesterIndicator.on("click", () => {
                let bar = d3.select(d3.event.currentTarget)
                let semNumber = this.deRomanize(bar.select("text").text());
                if (semester[0] === "s")
                    semNumber = "s" + semNumber
                Object.values(this.malla[semNumber]).forEach(ramo => {
                    ramo.isBeingClicked()
                })

            });

            globalY += semesterIndicatorHeight + separator;

            // Se renderizan los ramos del semestre
            Object.keys(this.malla[semester]).forEach(subject => {
                this.malla[semester][subject].draw(drawer, globalX, globalY, this.scaleX, this.scaleY);
                globalY += this.subjectType.getDisplayHeight(this.scaleY) + separator;
            })


            globalX += this.subjectType.getDisplayWidth(this.scaleX) + separator;
        })
    }

    // Renderiza las descripciones de las categorías
    showColorDescriptions() {
        Object.keys(this.categories).forEach(key => {
            let color_description = d3.select(".color-description").append("div")
                .attr("style", "display:flex;vertical-align:middle;margin-right:15px;");
            let circle_color = color_description.append("svg")
                .attr("height", "25px")
                .attr("width", "25px");
            circle_color.append("circle")
                .attr("r", 10)
                .attr("cx", 12)
                .attr("cy", 12)
                .attr("fill", this.categories[key][0]);

            color_description.append("span").text(this.categories[key][1]);

        });
    }

    // Permite que se revise si los ramos cumplen prerrequisitos
    enablePrerCheck() {
        this.checkPrer = true;
        this.verifyPrer()
    }

    // Revisa que ramos cumplen prerrequisitos y "oculta" los que no los cumplen
    verifyPrer() {
        if (this.checkPrer) {
            Object.values(this.ALLSUBJECTS).forEach(ramo => {
                ramo.verifyPrer();
            });
            this.saveApproved()
        }
    }

    // Retorna el sistema de créditos utilizado
    displayCreditSystem() {
        if (!this.showCreditSystem)
            return
        d3.select("#credits-system").text(this.sct ? 'SCT' : 'USM')
    }

    // Actualiza los datos como porcentaje de ramos aprobados etc
    updateStats() {
        if (!this.showCreditStats)
            return
        let currentCredits = 0;
        let currentRamos = 0;
        this.APPROVED.forEach(ramo => {
            currentCredits += ramo.getDisplayCredits();
            currentRamos += 1
        })
        let creditPercentage = currentCredits/this.totalCredits * 100;
        let careerAdvance = currentRamos/this.totalSubjects * 100;
        d3.select("#credits").text(parseInt(currentCredits))
        d3.select("#credPercentage").text(parseInt(creditPercentage))
        d3.select("#ramoPercentage").text(parseInt(careerAdvance))
    }

    // Limpia los ramos aprobados
    cleanSubjects() {
        let listToClean = [...this.APPROVED]
        listToClean.forEach(ramo => {
            ramo.cleanRamo()
        })
        this.verifyPrer()
        this.updateStats()
    }


    // Auto explanatorio
    approveSubject(subject) {
        this.APPROVED.push(subject)
    }

    // Auto explanatorio
    deApproveSubject(subject) {
        let _i = this.APPROVED.indexOf(subject);
        if (_i > -1) {
            this.APPROVED.splice(_i, 1);
        }
    }

    getSubject(sigla) {
        return this.ALLSUBJECTS[sigla]
    }

    // Auto explanatorio
    saveApproved() {
        if (this.saveEnabled) {
            let cacheName = "approvedRamos_" + this.currentMalla;
            let cacheToSave = [];
            this.APPROVED.forEach(ramo => {
                cacheToSave.push(ramo.sigla)
            });
            localStorage[cacheName] = JSON.stringify(cacheToSave);
        }
    }

    // Auto explanatorio
    loadApproved() {
        if (this.saveEnabled) {
            let cache = localStorage["approvedRamos_" + this.currentMalla]
            if (cache) {
                let loadedData = JSON.parse(cache)
                loadedData.forEach(siglaRamo => {
                    if (this.ALLSUBJECTS[siglaRamo] !== undefined)
                        this.ALLSUBJECTS[siglaRamo].approveRamo()
                })
                this.verifyPrer()
            }
        }
    }

    // EXTRA

    deRomanize(roman){
        let r_nums = this.getRnums();
        let a_nums = this.getAnums();
        let remainder = roman.replace(/i/g, "M");
        let arabic = 0, count = 0, test = remainder;

        let len=r_nums.length;
        for (let i=1; i<len; ++i ){
            const numchrs = r_nums[i].length;
            while( remainder.substr(0,numchrs) === r_nums[i]){
                if((count++) > 30) return -1;
                arabic += a_nums[i];
                remainder = remainder.substr(numchrs,remainder.length-numchrs);
            }
            if(remainder.length <= 0) break;
        }
        if(remainder.length !==0 ){
            alert(roman + " INVALID truncating to "+test.replace(remainder,'') );
        }
        if( (0 < arabic) && (arabic < 4000000) )return arabic;
        else return -1;
    }

    romanize(arabic) {
        if (arabic > 3999999 || arabic < 1) {
            return 'Expect number from 1 to 3,999,999';
        }
        let r_nums = this.getRnums();
        let a_nums = this.getAnums();
        let remainder = parseInt(arabic);
        let roman = '', count = 0;

        let len = r_nums.length;
        for (let i = 1; i < len; ++i) {
            while (remainder >= parseInt(a_nums[i])) {
                if ((count++) > 30) return -1;
                roman = roman + r_nums[i];
                remainder = remainder - a_nums[i];
            }
            if (remainder <= 0) break;
        }
        return roman;
    }


    getRnums() {
        let r_nums = Array();
        r_nums[1] = 'm';
        r_nums[2] = 'cm';
        r_nums[3] = 'd';
        r_nums[4] = 'cd';
        r_nums[5] = 'c';
        r_nums[6] = 'xc';
        r_nums[7] = 'l';
        r_nums[8] = 'xl';
        r_nums[9] = 'x';
        r_nums[10] = 'Mx';
        r_nums[11] = 'v';
        r_nums[12] = 'Mv';
        r_nums[13] = 'M';
        r_nums[14] = 'CM';
        r_nums[15] = 'D';
        r_nums[16] = 'CD';
        r_nums[17] = 'C';
        r_nums[18] = 'XC';
        r_nums[19] = 'L';
        r_nums[20] = 'XL';
        r_nums[21] = 'X';
        r_nums[22] = 'IX';
        r_nums[23] = 'V';
        r_nums[24] = 'IV';
        r_nums[25] = 'I';
        return r_nums;
    }

    getAnums() {
        let a_nums = Array();
        a_nums[1] = 1000000;
        a_nums[2] = 900000;
        a_nums[3] = 500000;
        a_nums[4] = 400000;
        a_nums[5] = 100000;
        a_nums[6] = 90000;
        a_nums[7] = 50000;
        a_nums[8] = 40000;
        a_nums[9] = 10000;
        a_nums[10] = 9000;
        a_nums[11] = 5000;
        a_nums[12] = 4000;
        a_nums[13] = 1000;
        a_nums[14] = 900;
        a_nums[15] = 500;
        a_nums[16] = 400;
        a_nums[17] = 100;
        a_nums[18] = 90;
        a_nums[19] = 50;
        a_nums[20] = 40;
        a_nums[21] = 10;
        a_nums[22] = 9;
        a_nums[23] = 5;
        a_nums[24] = 4;
        a_nums[25] = 1;
        return a_nums;
    }

    // Genera código de la malla generada para poder actualizar o agregar carreras
    generateCode() {
        let data = {}
        let expresion1 = /("s[0-9]+":)+|(\[(?:,?[^\[\]])+(?:,\[[^\]]*])(?:,?[^\]]*)+])+/g

        // Se crea la data a guardar según el formato de la malla
        Object.keys(this.malla).forEach(semester => {
            let key
            if (semester.includes("s"))
                key = semester
            else
                key = "s" + semester
            data[key] = []

            Object.keys(this.malla[semester]).forEach(sigla => {
                let subject = this.ALLSUBJECTS[sigla]
                let subjectData = []

                subjectData.push(subject.name)
                subjectData.push(subject.sigla)
                subjectData.push(subject.getUSMCredits())
                if (subject.USMtoSCT)
                    subjectData.push(0)
                else
                    subjectData.push(subject.getSCTCredits())

                subjectData.push(subject.category)
                subjectData.push([...subject.prer])
                subjectData.push(subject.dictatesIn)
                data[key].push(subjectData)

            })
        })

        // Luego se crea el string de la data y se le da el formato
        let mallaResult = JSON.stringify(data).match(expresion1);

        let s = "{\n"
        let first = true
        let firstSem = true
        mallaResult.forEach(item => {
            if (/("s[0-9]+":)/.test(item)) {
                if (firstSem) {
                    s += "    " + item + " [\n"
                    firstSem = false
                } else {
                    s += "\n    ],\n" + "    " + item + " [\n"
                }
                first = true
            } else if (first) {
                s += "        " + item
                first = false
            } else
                s += ",\n" + "        " + item
        })
        s += "\n" + "    " + "]\n" + "}"

        // Se repite el proceso con las categorías
        let expresion2 = /("[^\]]+\],?)/g
        let colorResult = JSON.stringify(this.categories).match(expresion2)
        let c = "{"
        colorResult.forEach(color => {
            c += "\n" + "    " + color
        })
        c += "\n}"
        this.generatedCode = [this.currentMalla,s,c]

        let shareCode = `{\n "name": "${this.generatedCode[0]}",\n "malla": ${this.generatedCode[1]},\n "categories": ${this.generatedCode[2]}\n}`
        // Si existe el lugar para mostrarlo, se muestra
        if (document.getElementById('mallaCode')) {
            new ClipboardJS('.btn');
            document.getElementById('mallaCode').textContent = s;
            document.getElementById('colorCode').textContent = c
            PR.prettyPrint()

            document.getElementById('abrev').value = this.currentMalla
            document.getElementById("carrMalla1").textContent = this.currentMalla
            document.getElementById("carrMalla2").textContent = this.currentMalla
            document.getElementById("carrColor1").textContent = this.currentMalla
            document.getElementById("carrColor2").textContent = this.currentMalla

            let file1 = new Blob([s], {"aplication/json": "aplication/json"});
            let file2 = new Blob([c], {"aplication/json": "aplication/json"});
            let file3 = new Blob([shareCode], {"aplication/json": "aplication/json"});
            let downloadLink1 = document.getElementById('dMalla')
            let downloadLink2 = document.getElementById('dColor')
            let downloadLink3 = document.getElementById('dShare')
            downloadLink1.setAttribute('href', URL.createObjectURL(file1))
            downloadLink1.setAttribute('download', "data_" + this.currentMalla + '.json')
            downloadLink2.setAttribute("href", URL.createObjectURL(file2))
            downloadLink2.setAttribute("download", "colors_" + this.currentMalla + '.json')
            downloadLink3.setAttribute('href', URL.createObjectURL(file3))
            downloadLink3.setAttribute('download', this.currentMalla + '.json')

        } else {
            // Si no, se imprime en la consola
            console.log(s)
            console.log(c)

        }
        if (document.getElementById("abrev")) {
            document.getElementById("abrev").addEventListener('input', function (input) {
                document.getElementById("carrMalla1").textContent = input.target.value.toUpperCase()
                document.getElementById("carrMalla2").textContent = input.target.value.toUpperCase()
                document.getElementById("carrColor1").textContent = input.target.value.toUpperCase()
                document.getElementById("carrColor2").textContent = input.target.value.toUpperCase()
                document.getElementById('dMalla').setAttribute('download', "data_" + input.target.value.toUpperCase() + '.json')
                document.getElementById('dColor').setAttribute("download", "colors_" + input.target.value.toUpperCase() + '.json')
                console.log(this.generatedCode[0])
                this.generatedCode[0] = input.target.value

                $('[data-toggle="tooltip"]').tooltip()
                $('[data-toggle="tooltip"]').tooltip('disable')


                let downloadLink3 = document.getElementById('dShare')
                let shareCode = `{\n "name": "${this.generatedCode[0]}",\n "malla": ${this.generatedCode[1]},\n "categories": ${this.generatedCode[2]}\n}`
                let file3 = new Blob([shareCode], {"aplication/json": "aplication/json"});

                downloadLink3.setAttribute('href', URL.createObjectURL(file3))
                downloadLink3.setAttribute('download', this.generatedCode[0] + '.json')
            }.bind(this))
        }
    }

    loadFile(e) {
        let input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json'
        input.multiple = false
        var reader = new FileReader();
        reader.addEventListener("load", function (e) {
            localStorage["sharedMalla"] = e.target.result;
            location.reload()
        });
    
        input.onchange = _this => {
            let files =   Array.from(input.files);
                reader.readAsText(files[0]);
    
              };
        input.click();
    
    }
}
class CustomMalla extends Malla {
    constructor(sct = false, ramoType = Ramo, scaleX = 1, scaleY = 1) {
        super(sct, ramoType, scaleX, scaleY);
        this.customSectors = undefined
        this.customSubjects = undefined
        this.customMalla = undefined
    }

    // Hace los mismo que el originar, solo que ademas obtiene primero los datos guardados de la generadora
    setCareer(carr, fullCareerName, relaPath) {
        let customSectors = localStorage["generatorUserCategory" + carr]
        let customSubjects = localStorage["generatorUserSubjects" + carr]
        let customMalla = localStorage["generatorUserData" + carr]
        if (customSubjects !== undefined)
            this.customSubjects = JSON.parse(customSubjects)
        if (customSectors !== undefined)
            this.customSectors = JSON.parse(customSectors)
        if (customMalla !== undefined)
            this.customMalla = JSON.parse(customMalla)

        return super.setCareer(carr, fullCareerName, relaPath);
    }

    setMallaAndCategories(malla, sectors) {
        if (this.customMalla === undefined) {
            super.setMallaAndCategories(malla,sectors)
            return
        }
        let longest_semester = 0;
        let totalCredits = 0;
        let totalRamos = 0;

        let subjectsList = new Set()
        let categoriesToUse = new Set()
        // Se crea una lista de todos los ramos de la malla
        Object.values(this.customMalla).forEach(list => {
            subjectsList = new Set([...subjectsList, ...list])
            if (list.length > longest_semester)
                longest_semester = list.length
            totalRamos += list.length

        })
        this.longestSemester = longest_semester;
        this.totalSubjects = totalRamos

        Object.keys(this.customMalla).forEach(semester => {
            this.malla[semester] = {};
            this.customMalla[semester].forEach(sigla => {

                // Buscar ramo en ramos oficiales
                Object.keys(malla).forEach(semester2 => {
                    let i = 0
                    for (i; i < malla[semester2].length; i++) {
                        if (malla[semester2][i][1] === sigla && this.customSubjects[sigla] === undefined) {
                            // Si se encuentra, y no fue editado
                            let subject = malla[semester2][i]
                            if (subject.length === 7) {
                                // Nuevo formato con ramos SCT
                                let prer = [...subject[5]]
                                categoriesToUse.add(subject[4])
                                prer.forEach(prer => {
                                    // se quitan los prerrequisitos que no estan en la malla
                                    if (!subjectsList.has(prer))
                                        subject[5].splice(subject[5].indexOf(prer),1)
                                })
                                this.malla[semester][sigla] = new this.subjectType(subject[0], subject[1], subject[2], subject[4], subject[5],this.SUBJECTID++, this, subject[3],false ,subject[6])
                            } else {
                                // Formato viejo
                                categoriesToUse.add(subject[3])
                                this.malla[semester][sigla] = new this.subjectType(subject[0], subject[1], subject[2], subject[3], (function hasPrer() {
                                    if (subject.length > 4) {
                                        let prer = [...subject[4]]
                                        // se quitan los prerrequisitos que no estan en la malla
                                        prer.forEach(prer => {
                                            if (!subjectsList.has(prer))
                                                subject[4].splice(subject[4].indexOf(prer),1)
                                        })
                                        return subject[4];
                                    }
                                    return [];
                                })(), this.SUBJECTID++, this);
                            }
                        return
                        }
                    }
                })

                // Si existe una edicion o no estaba en la malla oficial
                if (this.customSubjects){
                    if (this.customSubjects[sigla] !== undefined) {
                        let data = this.customSubjects[sigla]
                        categoriesToUse.add(data[2])
                        let prer = [...data[3]]
                        prer.forEach(prer => {
                            if (!subjectsList.has(prer))
                                data[3].splice(data[3].indexOf(prer), 1)
                        })
                        this.malla[semester][sigla] = new this.subjectType(data[0], sigla, data[1], data[2], data[3],
                            this.SUBJECTID++, this, data[4], false, data[5])
                    }
                    totalCredits += this.malla[semester][sigla].getDisplayCredits()
                    this.addSubject(this.malla[semester][sigla])
                }
            })
        })
        this.totalCredits = totalCredits
        this.categories = {}
        let categories
        if (this.customSectors)
            categories = this.customSectors
        else
            categories = sectors

        categoriesToUse = [...categoriesToUse]
        categoriesToUse.forEach(category => {
            this.categories[category] = categories[category]
        })

        this.isMallaSet = true;
        console.log(this.ALLSUBJECTS)
    }
}
let width = 100;
let height = 100;

class Ramo {
    static get width() {
        return width
    }

    static get height() {
        return height
    }

    static getDisplayWidth(scaleX) {
        return width * scaleX;
    }

    static getDisplayHeight(scaleY){
        return height * scaleY;
    }


    constructor(name, sigla, credits, category, prer = [], id, malla, creditsSCT = 0, isCustom = false, dictatesIn="") {
        // Propiedades del ramo
        this.name = name;
        this.sigla = sigla;
        this.credits = credits;
        this.category = category;
        this.prer = new Set(prer);
        if (creditsSCT){
            this.creditsSCT = creditsSCT
            this.USMtoSCT = false
        } else {
            this.creditsSCT = Math.round(credits * 5 / 3)
            this.USMtoSCT = true
        }
        this.dictatesIn = dictatesIn

        // Propiedades para renderizado e interacciones
        this.malla = malla
        this.isCustom = isCustom
        this.beenEdited= false
        this.id = id;
        this.ramo = null;
        this.approved = false;
        //console.log(this.category)
    }

    // Auto explanatorio
    getSCTCredits() {
        return this.creditsSCT
    }

    // Auto explanatorio
    getUSMCredits() {
        return this.credits;
    }

    // Actualiza uno o ambos créditos dependiendo de los valores de entrada
    updateCredits(creditsUSM, creditsSCT = 0) {
        this.credits = creditsUSM
        if (creditsSCT)
            this.creditsSCT = creditsSCT
        else
            this.creditsSCT = Math.round(creditsUSM * 5 / 3)
    }

    // Retorna los creditos del tipo correcto según como el usuario lo pida
    getDisplayCredits() {
        if (this.malla.sct) {
            return  this.getSCTCredits()
        } else {
            return this.getUSMCredits()
        }
    }

    // renderiza el ramo
    draw(canvas, posX, posY, scaleX, scaleY) {
        this.ramo = canvas.append('g')
            .attr("cursor", "pointer")
            .attr("role", "img")
            .classed("subject", true)
            // .attr("alt", "Texto de prueba")
            .attr('id', this.sigla);
        // Se establecen tamaños
        let sizeX = this.constructor.getDisplayWidth(scaleX),
            sizeY = this.constructor.getDisplayHeight(scaleY);
        let graybar = sizeY / 5;
        let credits = this.getDisplayCredits(this.credits);
        let color = this.malla.categories[this.category][0]

        let dictatesIn = {"":"¿ambos semestres?", "P": "semestres pares", "I": "semestres impares", "A": "ambos semestres"}
        let prers = ""
        let prerSize = this.prer.size - 1
        let counter = 0
        this.prer.forEach(prer => {
            if (counter === 0)
                prers += prer
            else if (counter === prerSize)
                prers += " y " + prer
            else
                prers += ", " + prer
            counter +=1
        })
        this.ramo.append("title").text(
            "Ramo " + this.sigla+ ", " + this.name+ ". Este ramo tiene " + this.getUSMCredits() + " créditos USM y " +
            this.getSCTCredits() + " créditos SCT. Se dicta en " + dictatesIn[this.dictatesIn] + " y "
            + (this.prer.size ? "tiene como prerrequisitos a " + prers : "no tiene prerrequisitos") + ".")

        this.ramo.append("rect")
            .attr("x", posX)
            .attr("y", posY)
            .attr("width", sizeX )
            .attr("height", sizeY)
            .attr("fill", color);

        // above bar
        this.ramo.append("rect")
            .attr("x", posX)
            .attr("y", posY)
            .attr("width", sizeX )
            .attr("height", graybar)
            .attr("fill", '#6D6E71')
            .classed('bars', true);

        // below bar
        this.ramo.append("rect")
            .attr("x", posX)
            .attr("y", posY + sizeY - graybar)
            .attr("width", sizeX )
            .attr("height", graybar)
            .attr("fill", '#6D6E71')
            .classed('bars', true);

        // credits rect
        this.ramo.append("rect")
            .attr("x", posX + sizeX  - 22 * scaleX)
            .attr("y", posY + sizeY - graybar)
            .attr("width", 20 * scaleX)
            .attr("height", graybar)
            .attr("fill", 'white');

        // texto créditos
        this.ramo.append("text")
            .attr("x", posX + sizeX  - 22 * scaleX + 20 * scaleX / 2)
            .attr("y", posY + sizeY - graybar / 2)
            .text(credits)
            .attr("font-weight", "regular")
            .attr("fill", "black")
            .attr("dominant-baseline", "central")
            .attr("text-anchor", "middle")
            .attr("font-size", 12 * scaleY);

        // Nombre ramo
        this.ramo.append("text")
            .attr("x", posX + sizeX  / 2)
            .attr("y", posY + sizeY / 2)
            .attr("dy", 0)
            .text(this.name)
            .attr("class", "ramo-label")
            .attr("fill", () => {
                if (this.needsWhiteText(color))
                    return "white";
                return '#222222';
            })
            .attr("font-size", 13)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "central");

        // Sigla
        this.ramo.append("text")
            .attr("x", posX + 2)
            .attr("y", posY + 10)
            .attr("dominant-baseline", "central")
            .text(this.sigla)
            .attr("font-weight", "bold")
            .attr("fill", "white")
            .attr("font-size", scaleX < 0.85 ? 11 : 12);

        // Indicador the semestres
        if (this.dictatesIn === "P" || this.dictatesIn === "I") {
            this.ramo.append("text")
                .attr("x", posX + sizeX - (scaleX < 0.85 ? 25 : 30))
                .attr("y", posY + 10)

                .attr("dominant-baseline", "central")
                .attr("text-anchor", "middle")
                .text(this.dictatesIn)
                .attr("font-weight", "bold")
                .attr("fill", "yellow")
                .attr("font-size", scaleX < 0.85 ? 11 : 12);
        }
        this.drawActions(posX, posY, sizeX, sizeY);


        // id
        this.ramo.append("circle")
            .attr("cx", posX + sizeX  - 10)
            .attr("cy", posY + graybar / 2)
            .attr("fill", "white")
            .attr("r", 8);
        this.ramo.append("text")
            .attr("x", posX + sizeX  - 10)
            .attr("y", posY + graybar / 2)
            .attr("dominant-baseline", "central")
            .attr("text-anchor", "middle")
            .attr("fill", "black")
            .attr('font-size', 10)
            .text(this.id);

        // prerr circles!
        let c_x = 0;
        this.prer.forEach((p) => {
            let r = 9,
                fontsize = 10,
                variantX = 5;
            let variantY = 5;
            if (scaleX < 0.83) {
                r--;
                fontsize--;
                variantX = 1;
                variantY--;
            }
            let prerColor = this.malla.categories[this.malla.ALLSUBJECTS[p].category][0]
            this.ramo.append("circle")
                .attr('cx', posX + r + c_x + variantX)
                .attr('cy', posY + sizeY - graybar / 2)
                .attr('r', r)
                .attr('fill', prerColor)
                .attr('stroke', 'white');
            this.ramo.append('text')
                .attr('x', posX + r + c_x + variantX)
                .attr('y', posY + sizeY - graybar / 2)
                .text(this.malla.ALLSUBJECTS[p].id)
                .attr("dominant-baseline", "central")
                .attr("text-anchor", "middle")
                .attr("font-size", fontsize)
                .attr("dy", 0)
                .attr('fill', () => {
                    if (this.needsWhiteText(prerColor))
                        return "white";
                    return '#222222';
                });
            c_x += r * 2;
        });
        this.createActionListeners();
        this.wrap(sizeX - 5, sizeY / 5 * 3);
    }

    // renderiza las animaciones de interacción
    drawActions(posX, posY, sizeX, sizeY) {
        if (this.ramo == null)
            return null;

        this.ramo.append("rect")
            .attr("x", posX)
            .attr("y", posY)
            .attr("width", sizeX)
            .attr("height", sizeY)
            .attr("fill", 'white')
            .attr("opacity", "0.001")
            .attr("class", "non-approved");

        let cross = this.ramo.append('g').attr("class", "cross").attr("opacity", 0);
        cross.append("path")
            .attr("d", "M" + posX + "," + posY + "L" + (posX + sizeX) + "," + (posY + sizeY))
            .attr("stroke", "#550000")
            .attr("stroke-width", 9);
    }

    // Crea las reacciones a las interacciones del usuario
    createActionListeners() {
        this.ramo.on("click", () => this.isBeingClicked());
    }

    // se llama cuando se pulsa del ramo
    isBeingClicked() {
        this.approveRamo();
        this.malla.verifyPrer();
        this.malla.updateStats();
        this.malla.saveApproved();
    }

    // Auto explanatorio
    approveRamo() {
        if (!this.approved) {
            if (!this.isCustom)
                d3.select("#" + this.sigla).select(".cross").transition().delay(20).attr("opacity", "1");
            this.malla.approveSubject(this)
        } else {
            if (!this.isCustom)
                d3.select("#" + this.sigla).select(".cross").transition().delay(20).attr("opacity", "0.01");
            this.malla.deApproveSubject(this)
            }
        this.approved = !this.approved;
    }

    // Se pone el ramo en el estado inicial
    cleanRamo() {
        // Se llama a metodos internos necesarios que "limpien" el ramo
        if (this.approved) {
            this.approveRamo()
        }
    }

    // Se verifica que el ramo tenga los prerrequisitos cumplidos
    verifyPrer() {
        if (this.isCustom)
            return;
        let _a = [];
        this.malla.APPROVED.forEach(function(ramo) {
            _a.push(ramo.sigla);
        });
        _a = new Set(_a);
        for (let r of this.prer) {
            if (!_a.has(r)) {
                this.ramo.select(".non-approved").transition().delay(20).attr("opacity", "0.71");
                return;
            }
        }
        this.ramo.select(".non-approved").transition().delay(20).attr("opacity", "0.0");
    }

    // función para encuadrar texto
    wrap(sizeX,sizeY) {
        let text = this.ramo.select(".ramo-label");
        // let emEquivalent = convertEm(1, text.node());
        let words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1, // ems
/*            y = text.attr("y"),
            dy = 0,*/
            fontsize = parseInt(text.attr("font-size"),10),
            tspan = text.text(null).append("tspan").attr("x", text.attr("x")).attr("dominant-baseline", "central").attr("dy", 0 + "em"),
            textLines,
            textHeight;
            word = words.pop();
        while (word) {
            line.push(word);
            tspan.text(line.join(" "));
            while (tspan.node().getComputedTextLength() > sizeX) {
                if (line.length === 1) {
                    text.attr("font-size", String(--fontsize));
                }
                else {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    // console.log(lineNumber + 1, lineHeight, dy, (lineNumber + 1) * lineHeight + dy,((lineNumber + 1) * lineHeight + dy) + "em");
                    tspan = text.append("tspan").attr("x", text.attr("x")).attr("dominant-baseline", "central").attr("dy",  lineHeight + "em").text(word);
                }
            }
            word = words.pop();
        }
        let texts = text.selectAll('tspan');
        text.attr("dy", 0); // forzar actualización de ems

        textLines = texts._groups[0].length;
        textHeight = text.node().getBoundingClientRect().height;


        while (textHeight > sizeY - 5) {
            text.attr("font-size", String(--fontsize));
            text.attr("dy", 0); // forzar actualización de ems
            textHeight = text.node().getBoundingClientRect().height;
            lineNumber = 0;
        }

        if (textLines !== 1) {
            let firstTspan = texts.filter(function (d, i) { return i === 0 });
            firstTspan.attr("dy", - (lineHeight * textLines / 2 - lineHeight / 2) + "em");
        }

        text.attr("dy", 0); // forzar actualización de ems


        // Funciones
        // function getElementFontSize(context) {
        //     // Returns a number
        //     return parseFloat(
        //         // of the computed font-size, so in px
        //         getComputedStyle(
        //             // for the given context
        //             context ||
        //             // or the root <html> element
        //             document.documentElement
        //         ).fontSize
        //     );
        // }

        // function convertEm(value, context) {
        //     return value * getElementFontSize(context);
        // }
    }

    // retorna true si el color contrasta mejor con texto blanco
    needsWhiteText(colorHex) {
        // Convert hex to RGB first
        let r = 0, g = 0, b = 0;
        if (colorHex.length === 4) {
            r = "0x" + colorHex[1] + colorHex[1];
            g = "0x" + colorHex[2] + colorHex[2];
            b = "0x" + colorHex[3] + colorHex[3];
        } else if (colorHex.length === 7) {
            r = "0x" + colorHex[1] + colorHex[2];
            g = "0x" + colorHex[3] + colorHex[4];
            b = "0x" + colorHex[5] + colorHex[6];
        }
        // console.log(r,g,b)
        // Then to HSL
        let rgb = [0, 0, 0];
        rgb[0] = r / 255;
        rgb[1] = g / 255;
        rgb[2] = b / 255;

        for (let color in rgb) {
            if (rgb[color] <= 0.03928) {
                rgb[color] /= 12.92
            } else {
                rgb[color] = Math.pow(((rgb[color] + 0.055) / 1.055), 2.4)
            }

        }

        // c <= 0.03928 then c = c/12.92 else c = ((c+0.055)/1.055) ^ 2.4
        let l = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
        // console.log(l)
        return l <= 0.6; // este valor deberia ser mas bajo según estandares...
    }

}
class SelectableRamo extends Ramo {

    constructor(name, sigla, credits, sector, prer, id, malla, creditsSCT = 0, isCustom=false, dictatesIn = "") {
        super(name, sigla, credits, sector, prer, id, malla, creditsSCT, isCustom, dictatesIn);
        this.isCustom = isCustom;
        this.selected = false;
    }

    drawActions(posX, posY, sizeX, sizeY) {
        super.drawActions(posX, posY, sizeX, sizeY);
        this.ramo.append("rect")
            .attr("x", posX)
            .attr("y", posY)
            .attr("width", sizeX)
            .attr("height", sizeY)
            .attr("stroke", 'green')
            .attr("stroke-width", '7')
            .attr("opacity", "0.001")
            .attr("fill-opacity", "0.001")
            .attr("class", "selected");
    }

    // acciones a realizar cuando se clickea el ramo
    isBeingClicked() {
        this.selectRamo()
    }

    // se selecciona o deselecciona el ramo con su respectiva animación
    selectRamo() {
        if (this.approved) { // Si el ramo esta aprobado, no se selecciona
            if (!this.isCustom) {

                this.showWarning()
            }
            return;
        }

        if (!this.selected) { // Ramo se ha seleccionado

            if (!this.isCustom)
                this.ramo.select(".selected").transition().delay(20).attr("opacity", ".8");

            this.malla.semesterManager.addSubject(this);

        } else { // Ramo ya no esta seleccionado
            if (!this.isCustom)
                this.ramo.select(".selected").transition().delay(20).attr("opacity", "0.01");

            this.malla.semesterManager.removeSubject(this)
            let card = d3.select('#p-' + this.sigla);
            card.transition().duration(300).style("opacity", "0.001").remove();

        }
        this.selected = !this.selected;
    };

    // activa la animación de warning con el color que se desee
    showWarning(warningColor = "red") {
        if (!this.isCustom) {
            this.ramo.select(".selected").attr('stroke',warningColor);
            let animation = this.ramo.select(".selected").transition().duration(200).attr("opacity", ".8")
                .transition().duration(150).attr("opacity", ".5")
                .transition().duration(150).attr("opacity", ".8")
                .transition().duration(200).attr("opacity", ".001")
                .attr('stroke','green');
            if (this.selected) {
                animation.transition().attr("opacity", ".8")
            }
        }
    }
}
class SemesterManager {
    constructor(malla, card, mallaEditor = false) {
        // Propiedades
        this.selectedPerSemester = {1: []}
        this.semester = 1;
        this.saveEnabled = false
        this.subjectsInManySemesters = false
        this.malla = malla
        this.card = d3.select(card)
        this.displayedSubjects = {}
        this.saveEnabled = true

        if (mallaEditor)
            this.mallaEditor = mallaEditor
        else
            this.mallaEditor = null


        // se vincula la interfaz con metodos
        this.semesterIndicator = this.card.select("#semester")
        this.card.select("#reset").on("click", () => this.cleanSemester())
        this.card.select("#resetc").on("click", () => this.cleanAll())
        this.card.select("#forward").on("click", () => this.nextSemester())
        this.backButton = this.card.select("#back").on("click", () => this.prevSemester())
        this.noSubjectsText = this.card.select(".no-subjects")


        this.updateSemesterIndicator()
    }

    // actualiza el indicador de semestre de la página
    updateSemesterIndicator() {
        this.semesterIndicator.text(this.semester)
    }

    // agrega la asignatura al semestre
    addSubject(subject) {
        console.log(this.selectedPerSemester[this.semester])
        let undefinedSemester = this.selectedPerSemester[this.semester] === undefined
        if (!undefinedSemester) {
            let semesterEmpty = this.selectedPerSemester[this.semester].length === 0
            if (semesterEmpty) {
                this.noSubjectsText.classed("d-none", true)
                this.selectedPerSemester[this.semester] = []
            }
        } else {
            this.noSubjectsText.classed("d-none", true)
            this.selectedPerSemester[this.semester] = []
        }

        this.selectedPerSemester[this.semester].push(subject)
        this.displaySubject(subject)
    }

    // elimina la asignatura del semestre
    removeSubject(subject) {
        let _i = this.selectedPerSemester[this.semester].indexOf(subject);
        if (_i > -1) {
            this.selectedPerSemester[this.semester].splice(_i, 1);
        }
        this.unDisplaySubject(subject)
        if (this.selectedPerSemester[this.semester].length === 0) {
            this.noSubjectsText.classed("d-none", false)
        }
    }

    // elimina la asignatura de semestres guardados, sin contar el semestre actual
    removeSubjectOutsideSemester(subject) {
        Object.keys(this.selectedPerSemester).forEach(semester => {
            if (semester !== this.semester) {
                let found = this.selectedPerSemester[semester].indexOf(subject)
                if (found !== -1){
                    this.selectedPerSemester[semester].splice(found,1)
                    if (semester < this.semester)
                        subject.approveRamo()
                }
            }
        })
    }

    // muestra la asignatura en el manager
    displaySubject(subject) {
        // Do something
        // this.displayedSubjects[subject.sigla] =
    }

    // actualiza la asignatura en el manager en caso de haberse editado
    updateDisplayedSubject(subject) {}

    // elimina la asignatura del manager
    unDisplaySubject(subject) {
        // Do something
    }

    // se pasa al siguiente semestre
    nextSemester() {
        let backup = [...this.selectedPerSemester[this.semester]]
        this.saveSemesters()
        this.saveEnabled = false
        this.cleanSemester()
        this.selectedPerSemester[this.semester] = backup
        this.selectedPerSemester[this.semester].forEach(subject => subject.approveRamo())
        this.semester++
        if (this.semester === 2) {
            this.backButton.classed("disabled", false)
            this.backButton.attr("disabled", null)
        }
        this.updateSemesterIndicator()
        if (this.selectedPerSemester[this.semester] !== undefined) {
            backup = [...this.selectedPerSemester[this.semester]]
            backup.forEach(subject => {
                subject.selectRamo()
            });
            this.selectedPerSemester[this.semester] = backup
        }
        this.saveEnabled = true
        this.malla.verifyPrer()

    }

    // se pasa al semestre anterior
    prevSemester() {
        let backup = this.selectedPerSemester[this.semester]
        if ((backup === undefined|| backup === []) && this.semester >= Object.values(this.selectedPerSemester).length)
            delete this.selectedPerSemester[this.semester]
        else
            backup = [...this.selectedPerSemester[this.semester]]
        this.saveSemesters()
        this.saveEnabled = false
        this.cleanSemester()
        if ((backup !== undefined && backup !== []))
            this.selectedPerSemester[this.semester] = backup
        this.deApprovePrevSemester()
            this.semester--
        if (this.semester === 1) {
            this.backButton.classed("disabled", true)
            this.backButton.attr("disabled", "disabled")
        }
            this.updateSemesterIndicator()
        backup = [... this.selectedPerSemester[this.semester]]
        backup.forEach(subject => {
            subject.selectRamo()
        })
        this.selectedPerSemester[this.semester] = backup
        this.saveEnabled = true
        this.malla.verifyPrer()
    }

    // se desaprueban las asinaturas del semestre anterior para hacer posible su selección
    deApprovePrevSemester() {
        this.selectedPerSemester[this.semester - 1].forEach(subject => {
            if (subject.approved)
                subject.approveRamo()
        })
    }

    // se quitan todas las asignaturas del semestre
    cleanSemester() {
        if (this.selectedPerSemester[this.semester] !== undefined) {
            let semesterToClean = [...this.selectedPerSemester[this.semester]]
            semesterToClean.forEach(subject => {
                subject.selectRamo()
            })
        }

    }

    // se "reinicia" eliminando todo dato guardado
    cleanAll () {
        this.saveEnabled = false
        this.cleanSemester()
        this.semester = 1
        this.updateSemesterIndicator()
        this.selectedPerSemester = {}
        this.backButton.classed("disabled", true)
        this.backButton.attr("disabled", "disabled")
        this.malla.cleanSubjects()
        this.saveEnabled = true
        this.saveSemesters()

    }


    loadSemesters() {
        console.log("Fake Loading...")
        // load all semesters from cache
    }

    saveSemesters() {
        if (this.saveEnabled) {
            // Save all semesters
            console.log("Fake Saving...")
        }
    }
}
class Priorix extends SemesterManager {
    constructor(malla, card) {
        super(malla, card);
        this.faes = {
            1: 1
        }

        // {USM : {1 : numero, 2: otroNumero, ...}}, SCT : {...}}
        this.prevSemesterSums = {
            'USM': {},
            'SCT': {}
        }
        this.currentSemesterSum = {
            'USM': 0,
            'SCT': 0
        }
        this.totalCredits = {
            'USM': 0,
            'SCT': 0
        }

        // {USM : {1 : numero, 2: otroNumero, ...}}, SCT : {...}}
        this.totalApprovedCredits = {
            'USM': {},
            'SCT': {}
        }

        // {1 : {siglaRamo: nota, ...}, ...}
        this.subjectGrades= {}

        this.card.select(".fae").on('input', () => this.calculate())
        this.calculationsEnabled = true

        this.mallaEditor = new MallaEditor(this, "#unoficialSubjects")

    }

    // overwritten

    addSubject(subject) {
        super.addSubject(subject);
        this.totalCredits['USM'] = this.totalCredits['USM'] + subject.getUSMCredits()
        this.totalCredits['SCT'] = this.totalCredits['SCT'] + subject.getSCTCredits()
        this.calculate()

    }

    removeSubject(subject) {
        super.removeSubject(subject);
        this.totalCredits['USM'] = this.totalCredits['USM'] - subject.getUSMCredits()
        this.totalCredits['SCT'] = this.totalCredits['SCT'] - subject.getSCTCredits()
        this.calculate()


    }

    // elimina todo rastro del ramo a elimnar y vuelve a calclular la prioridad
    removeSubjectOutsideSemester(subject) {
        Object.keys(this.selectedPerSemester).forEach(semester => {
            if (semester !== this.semester) {
                let found = this.selectedPerSemester[semester].indexOf(subject)
                if (found !== -1){
                    this.selectedPerSemester[semester].splice(found,1)
                    if (semester < this.semester) {
                        subject.approveRamo()
                        this.totalCredits["USM"] -= subject.getUSMCredits()
                        this.totalCredits["SCT"] -= subject.getSCTCredits()

                        let grade = this.subjectGrades[semester][subject.sigla]
                        let scoreToDeleteUSM = grade * subject.getUSMCredits()
                        let scoreToDeleteSCT = grade * subject.getSCTCredits()
                        delete this.subjectGrades[semester][subject.sigla]
                        for (semester; semester < this.semester; semester++) {
                            if (grade > 54) {
                                this.totalApprovedCredits["USM"][semester] -= subject.getUSMCredits()
                                this.totalApprovedCredits["SCT"][semester] -= subject.getSCTCredits()
                            }
                            this.prevSemesterSums["USM"][semester] -= scoreToDeleteUSM
                            this.prevSemesterSums["SCT"][semester] -= scoreToDeleteSCT
                        }
                    }
                }
            }
        })
        //console.log(this.totalApprovedCredits, this.totalCredits, this.prevSemesterSums, this.currentSemesterSum, this.subjectGrades)
    }

    displaySubject(subject) {
        let i = this.malla.APPROVED.indexOf(subject);
        if (i !== -1) {
            // do something
            return
        }

        let subjectInfo = this.card.select(".subjects").append('div')
        subjectInfo.attr('id', "p-" + subject.sigla);
        subjectInfo.attr('class', 'form-group mb-2');
        subjectInfo.attr('style', 'opacity:0.001');
        subjectInfo.append('label')
            .attr('class', 'text-left mb-0')
            .attr('for', 'nota-' + subject.sigla)
            .text(subject.name);
        let isOdd = Boolean(this.semester % 2)

        subjectInfo.append("small")
            .classed("form-text bg-light rounded text-center mt-0 d-block mb-1 text-danger infmessage", true)
        if (isOdd && subject.dictatesIn === "P")
            subjectInfo.select(".infmessage")
                .classed("d-block", false)
                .text("Esta asignatura normalmente solo se dicta en semestres pares");
    else if (!isOdd && subject.dictatesIn === "I")
            subjectInfo.select("infmessage")
                .classed("d-block", false)
                .text("Esta asignatura normalmente solo se dicta en semestres Impares");
        let subjectGrade = subjectInfo.append('div');
        subjectGrade.attr('class','input-group');
        subjectGrade.append('div')
            .attr('class','input-group-prepend')
            .append('span')
            .attr('class','input-group-text')
            .text('Nota');
        let gradeInput = subjectGrade.append('input')
            .attr('class', 'form-control')
            .attr('id', 'nota-' + subject.sigla)
            .attr('name', 'nota-' + subject.sigla)
            .attr('type', 'number')
            .attr('inputmode', 'numeric')
            .attr('autocomplete', 'off')
            .attr('min','0')
            .attr('max','100')
            .attr('placeholder', '0')
            .on('input', () => {
                this.calculate()
            })
        subjectGrade.append('div')
            .attr('class','input-group-append')
            .append('span')
            .attr('class','input-group-text')
            .text('x ' + subject.getUSMCredits() + ' USM | ' + subject.getSCTCredits() + ' SCT');




        subjectInfo.transition().duration(300).style("opacity", "1");

        this.displayedSubjects[subject.sigla] = [subjectInfo, gradeInput]
        this.calculate()
    }

    unDisplaySubject(subject) {
       this.displayedSubjects[subject.sigla][1]
            .on('input', null);
        this.displayedSubjects[subject.sigla][0]
            .transition().duration(300).style("opacity", "0.001").remove();
        delete this.displayedSubjects[subject.sigla]
    }

    nextSemester() {
        this.calculationsEnabled = false
        let subjectsToUpdate = []
        let backup = [...this.selectedPerSemester[this.semester]]
        this.prevSemesterSums["USM"][this.semester] = this.currentSemesterSum["USM"]
        this.prevSemesterSums["SCT"][this.semester] = this.currentSemesterSum["SCT"]
        backup.forEach(subject => {
                this.totalCredits["USM"] += subject.getUSMCredits()
                this.totalCredits["SCT"] += subject.getSCTCredits()
            if (this.displayedSubjects[subject.sigla][1].property("value") > 54) {
                subject.selectRamo()
                subject.approveRamo()
            } else if (!this.selectedPerSemester[this.semester+1]) {
                this.displayedSubjects[subject.sigla][1].property("value", "")
                this.displayedSubjects[subject.sigla][0].select(".infmessage")
                    .classed("d-block", false)
                    .text("Asignatura reprobada el semestre anterior")
                subject.showWarning("yellow")
            } else {
                subject.selectRamo()
            }
            subjectsToUpdate.push(subject)
        })
        let subjectaNotAprroved = this.selectedPerSemester[this.semester]
        this.selectedPerSemester[this.semester] = backup
        this.semester++
        if (this.semester === 2) {
            this.backButton.classed("disabled", false)
            this.backButton.attr("disabled", null)
        }
            this.updateSemesterIndicator()
        if (this.selectedPerSemester[this.semester]) {
            backup = [...this.selectedPerSemester[this.semester]]
            backup.forEach(subject => {
                subject.selectRamo()
                this.displayedSubjects[subject.sigla][1].property("value", this.subjectGrades[this.semester][subject.sigla])
                subjectsToUpdate.push(subject)
            });
            this.selectedPerSemester[this.semester] = backup
        } else {
            this.selectedPerSemester[this.semester] = subjectaNotAprroved
        }
        this.calculationsEnabled = true
        this.calculate()
        this.malla.verifyPrer()
        subjectsToUpdate.forEach(subject => this.mallaEditor.updateState(subject))

        //super.nextSemester();
    }

    prevSemester() {
        this.calculationsEnabled = false
        let subjectsToUpdate = []
        let backup = this.selectedPerSemester[this.semester]
        if ((backup === undefined|| backup === []) && this.semester >= Object.values(this.selectedPerSemester).length)
            delete this.selectedPerSemester[this.semester]
        else
            backup = [...this.selectedPerSemester[this.semester]]

        this.deApprovePrevSemester()
        let prevSelected = [...this.selectedPerSemester[this.semester - 1]]
        backup.forEach(subject => {
            if (prevSelected.indexOf(subject) === -1) {
                subject.selectRamo()
            } else {
                this.totalCredits["USM"] -= subject.getUSMCredits()
                this.totalCredits["SCT"] -= subject.getSCTCredits()
            }
            subjectsToUpdate.push(subject)
        })
        if ((backup !== []))
            this.selectedPerSemester[this.semester] = backup

        this.semester--
        if (this.semester === 1) {
            this.backButton.classed("disabled", true)
            this.backButton.attr("disabled", 'disabled')
        }
        prevSelected.forEach(subject => {
            if (!subject.selected) {
                subject.selectRamo()
                this.totalCredits["USM"] -= subject.getUSMCredits()
                this.totalCredits["SCT"] -= subject.getSCTCredits()
            }
            this.displayedSubjects[subject.sigla][1].property("value", this.subjectGrades[this.semester][subject.sigla])
            subjectsToUpdate.push(subject)
        })
        this.selectedPerSemester[this.semester] = prevSelected
        this.updateSemesterIndicator()
        this.calculationsEnabled = true
        this.calculate()
        this.malla.verifyPrer()
        subjectsToUpdate.forEach(subject => this.mallaEditor.updateState(subject))

        //super.prevSemester();
    }

    cleanSemester() {
        super.cleanSemester();
        this.faes[this.semester] = 1
        this.card.select(".fae").node().value = 1
        this.calculate()

    }

    cleanAll() {
        this.calculationsEnabled = false
        super.cleanAll();
        this.faes = {
            1: 1
        }
        this.prevSemesterSums = {
            'USM': {},
            'SCT': {}
        }
        this.currentSemesterSum = {
            'USM': 0,
            'SCT': 0
        }
        this.totalCredits = {
            'USM': 0,
            'SCT': 0
        }
        this.totalApprovedCredits = {
            'USM': {},
            'SCT': {}
        }
        this.subjectGrades = {}
        this.card.select(".fae").node().value = 1
        this.selectedPerSemester[1] = []
        this.calculationsEnabled = true
        this.calculate()
        delete localStorage["priorixUserData" + this.malla.currentMalla]
        this.mallaEditor.updateAllStates()
        this.backButton.classed("disabled", true)
        this.backButton.attr("disabled", 'disabled')
    }

    saveSemesters() {
        if (this.saveEnabled) {
            let cache = JSON.stringify([this.subjectGrades, this.faes])
            localStorage["priorixUserData" + this.malla.currentMalla] = cache

        }
    }

    loadSemesters() {
        let needtoDelete = false
        let cache = localStorage["priorixUserData" + this.malla.currentMalla]
        if (cache) {
            cache = JSON.parse(cache)

        } else {
            let oldSemesterCache = localStorage["prioridad-" + this.malla.currentMalla + "_SEMESTRES"]
            let oldFaeCache = localStorage["prioridad-" + this.malla.currentMalla + "_SEMESTRES"]
            if (oldFaeCache && oldSemesterCache) {
                cache = []
                cache.push(JSON.parse(oldSemesterCache))
                cache.push(JSON.parse(oldFaeCache))
                localStorage["priorixUserData" + this.malla.currentMalla] = JSON.stringify(cache)
                needtoDelete = true
            } else
                return
        }
        this.saveEnabled = false
        this.subjectGrades = Object.assign({}, cache[0])
        this.faes = cache[1]
        let i = 1
        let firstSemester = this.subjectGrades[1]
        this.selectedPerSemester[1] = []
        let subjectsNotFound = {}
        Object.keys(firstSemester).forEach(sigla => {
            if (this.malla.ALLSUBJECTS[sigla] !== undefined) {
                this.malla.ALLSUBJECTS[sigla].selectRamo()
                this.displayedSubjects[sigla][1].property("value", cache[0][1][sigla])
            } else {
                if (subjectsNotFound[1] === undefined) {
                    subjectsNotFound[1] = []
                }
                subjectsNotFound[1].push([sigla + ': ' + this.subjectGrades[1][sigla]])
                delete this.subjectGrades[1][sigla]
            }
        })
        this.calculate()
        for (i; i < Object.keys(this.subjectGrades).length; i++) {
            this.selectedPerSemester[i+1] = []
            Object.keys(this.subjectGrades[i+1]).forEach(sigla => {
                if (this.malla.ALLSUBJECTS[sigla] !== undefined)
                    this.selectedPerSemester[i+1].push(this.malla.ALLSUBJECTS[sigla])
                else {
                    if (subjectsNotFound[i+1] === undefined)
                        subjectsNotFound[i+1] = []
                    subjectsNotFound[i+1].push([sigla + ': ' + this.subjectGrades[i+1][sigla]])
                    delete this.subjectGrades[i+1][sigla]
                }
            })
            this.nextSemester()
        }
        if (Object.keys(subjectsNotFound).length !== 0){
            let toast = $('.toast')
            toast.toast('show')
            let list = d3.select('#deletedSubjects').append('ul')
            Object.keys(subjectsNotFound).forEach(sem => {
                let nestedList = list.append('li').text(`Semestre ${sem}`).append('ul')
                subjectsNotFound[sem].forEach(subject => {
                    nestedList.append('li').text(subject)
                })
            })
            d3.select('#deletedCard').classed('d-none', false)
        }
        this.saveEnabled = true
        if (needtoDelete) {
            this.saveSemesters()
            delete localStorage["prioridad-" + this.malla.currentMalla + "_SEMESTRES"]
            delete localStorage["prioridad-" + this.malla.currentMalla + "_SEMESTRES"]
        }

    }

    // NEW!!
    // Calcula la prioridad y actualiza el resultado mostrado
    calculate() {
        if (this.calculationsEnabled) {
            let currentApprovedCreditsUSM, currentApprovedCreditsSCT
            let currentSemesterSumUSM, currentSemesterSumSCT
            let semesterGrades = {}
            if (this.semester !== 1) {
                currentApprovedCreditsUSM = this.totalApprovedCredits["USM"][this.semester - 1]
                currentApprovedCreditsSCT = this.totalApprovedCredits["SCT"][this.semester - 1]

                currentSemesterSumUSM = this.prevSemesterSums["USM"][this.semester - 1]
                currentSemesterSumSCT = this.prevSemesterSums["SCT"][this.semester - 1]
            } else {
                currentApprovedCreditsUSM = 0
                currentApprovedCreditsSCT = 0
                currentSemesterSumUSM = 0
                currentSemesterSumSCT = 0
            }
            this.selectedPerSemester[this.semester].forEach(subject => {
                let grade = this.displayedSubjects[subject.sigla][1].property("value")
                semesterGrades[subject.sigla] = grade
                if (grade > 54) {
                    currentApprovedCreditsUSM += subject.getUSMCredits()
                    currentApprovedCreditsSCT += subject.getSCTCredits()
                }
                currentSemesterSumUSM = currentSemesterSumUSM + grade * subject.getUSMCredits()
                currentSemesterSumSCT = currentSemesterSumSCT + grade * subject.getSCTCredits()
            })
            let fae = this.card.select(".fae").property("value")
            let resultUSM = 0
            let resultSCT = 0
            if (this.totalCredits['USM'] !== 0) {
                resultUSM = 100 * (currentSemesterSumUSM / (14 * Math.pow(this.semester, 1.06))) * currentApprovedCreditsUSM / this.totalCredits['USM'] * fae
                resultUSM = Math.round(resultUSM * 100) / 100.0
                resultSCT = 100 * (currentSemesterSumSCT / (14 * 5 / 3 * Math.pow(this.semester, 1.06))) * currentApprovedCreditsSCT / this.totalCredits['SCT'] * fae
                resultSCT = Math.round(resultSCT * 100) / 100.0

            }
            // this.card.select('.resUSM').text(resultUSM)
            this.card.select('.resSCT').text(resultSCT)
            // save results
            this.subjectGrades[this.semester] = semesterGrades
            this.currentSemesterSum["USM"] = currentSemesterSumUSM
            this.currentSemesterSum["SCT"] = currentSemesterSumSCT
            this.faes[this.semester] = fae
            this.totalApprovedCredits["USM"][this.semester] = currentApprovedCreditsUSM
            this.totalApprovedCredits["SCT"][this.semester] = currentApprovedCreditsSCT
            //console.log(this.totalApprovedCredits, this.totalCredits, this.prevSemesterSums, this.currentSemesterSum, this.subjectGrades)
            this.saveSemesters()
        }
    }
}
class Generator extends SemesterManager {
    constructor(malla, card) {
        super(malla, card);
        this.mallaEditor = new MallaEditor(this, "#unoficialSubjects", "#sectors")
    }

    displaySubject(subject) {
        if (subject.approved) {
            subject.showWarning()
        } else {
            let subjectInfo = this.card.select(".subjects").append('li');
            subjectInfo.attr('id','per-' + subject.sigla)
                .classed('list-group-item', true)
                .classed('d-flex', true)
                .classed('align-items-center', true)
                .classed('py-0', true)
                .classed('pr-0', true)
                .style('opacity','0.01')
                .transition().duration(300).style('opacity','1');
            let left = subjectInfo.append('div');
            left.classed('flex-grow-1', true)
                .classed('mr-3', true)
                .classed('py-2', true)

            left.append("p")
                .classed("my-0", true)
                .text(subject.name);
            let isOdd = Boolean(this.semester % 2)
            if (isOdd && subject.dictatesIn === "P")
                left.append("p").attr("id","dictatesIn-" + subject.sigla).style("line-height", 1).classed("my-0", true).append("small")
                    .classed("text-center my-0 text-danger", true)
                    .text("Esta asignatura normalmente solo se dicta en semestres pares");
            else if (!isOdd && subject.dictatesIn === "I")
                left.append("p").attr("id","dictatesIn-" + subject.sigla).style("line-height", 1).classed("my-0", true).append("small")
                    .classed("text-center text-danger", true)
                    .text("Esta asignatura normalmente solo se dicta en semestres Impares");

            let right = subjectInfo.append("button")
            right.classed("btn btn-secondary", true)
                .attr("type", "button")
                .text("Editar");
            right.on("click", this.mallaEditor.setUpModal.bind(this.mallaEditor, true, subject))
            // let rigth = card.append('button');
            // rigth.classed('btn', true)
            //     .classed('btn-warning', true)
            //     // .classed('text-white', true)
            //     .classed('align-self-stretch', true)
            //     .attr('type','button')
            //     .attr('onclick','editRamo("' + self.sigla + '")')
            //     .text('Editar');
            this.displayedSubjects[subject.sigla] = subjectInfo
            this.mallaEditor.updateState(subject)
            this.saveSemesters()
        }

    }

    updateDisplayedSubject(subject) {
        super.updateDisplayedSubject(subject)
        let subjectInfo = this.displayedSubjects[subject.sigla]
        if (subjectInfo) {
            subjectInfo.select("div").text(subject.name)
            let dictates = subjectInfo.select("#dictatesIn-" + subject.sigla)
            if (dictates)
                dictates.remove()

            let isOdd = Boolean(this.semester % 2)
            if (isOdd && subject.dictatesIn === "P")
                subjectInfo.select("div").append("p").attr("id","dictatesIn-" + subject.sigla).style("line-height", 1).classed("my-0", true).append("small")
                    .classed("text-center my-0 text-danger", true)
                    .text("Esta asignatura normalmente solo se dicta en semestres pares");
            else if (!isOdd && subject.dictatesIn === "I")
                subjectInfo.select("div").append("p").attr("id","dictatesIn-" + subject.sigla).style("line-height", 1).classed("my-0", true).append("small")
                    .classed("text-center text-danger", true)
                    .text("Esta asignatura normalmente solo se dicta en semestres impares");
        }
    }

    unDisplaySubject(subject) {
        this.displayedSubjects[subject.sigla]
            .transition().duration(300).style("opacity", "0.001").remove();
        delete this.displayedSubjects[subject.sigla]
        this.saveSemesters()

    }

    nextSemester() {
        super.nextSemester();
        if (this.mallaEditor)
            // indica que hay que actualizar la tabla de asignaturas no oficiales
            this.mallaEditor.semesterChange()
    }

    prevSemester() {
        super.prevSemester();
        // indica que hay que actualizar la tabla de asignaturas no oficiales
        if (this.mallaEditor)
            this.mallaEditor.semesterChange()
    }

    cleanAll() {
        super.cleanAll();
        delete localStorage["generatorUserData" + this.malla.currentMalla]
    }

    saveSemesters() {
        if (this.saveEnabled) {

            let cache = {}
            Object.keys(this.selectedPerSemester).forEach(semester => {
                let list = []
                this.selectedPerSemester[semester].forEach(subject => {
                    list.push(subject.sigla)
                })
                cache[semester] = list
            })
            cache = JSON.stringify(cache)
            localStorage["generatorUserData" + this.malla.currentMalla] = cache
        }
    }

    loadSemesters() {
        let needToDelete = false
        let cache = localStorage["generatorUserData" + this.malla.currentMalla]
        if (!cache) {
            cache = localStorage["Custom-" + this.malla.currentMalla + "_SEMESTRES"]
            if (!cache)
                return
            localStorage["generatorUserData" + this.malla.currentMalla] = cache
        }
        if (cache) {
            cache = JSON.parse(cache)
            this.saveEnabled = false
            let subjectsNotFound = {}
            let firstSemester = cache[1]
            firstSemester.forEach(sigla => {
                if (this.malla.ALLSUBJECTS[sigla] !== undefined) {
                    this.malla.ALLSUBJECTS[sigla].selectRamo()
                } else {
                    if (subjectsNotFound[1] === undefined) {
                        subjectsNotFound[1] = []
                    }
                    subjectsNotFound[1].push(sigla)
                }
            })
            let i = 1
            for (i; i < Object.keys(cache).length; i++) {
                this.selectedPerSemester[i + 1] = []
                cache[i + 1].forEach(sigla => {
                    if (this.malla.ALLSUBJECTS[sigla] !== undefined)
                        this.selectedPerSemester[i+1].push(this.malla.ALLSUBJECTS[sigla])
                    else {
                        if (subjectsNotFound[i+1] === undefined)
                            subjectsNotFound[i+1] = []
                        subjectsNotFound[i+1].push(sigla)
                    }
                })
                this.nextSemester()
            }
            if (Object.keys(subjectsNotFound).length !== 0) {
                console.log(subjectsNotFound)
                let toast = $('.toast')
                toast.toast('show')
                let list = d3.select('#deletedSubjects').append('ul')
                Object.keys(subjectsNotFound).forEach(sem => {
                    let nestedList = list.append('li').text(`Semestre ${sem}`).append('ul')
                    subjectsNotFound[sem].forEach(subject => {
                        nestedList.append('li').text(subject)
                    })
                })
                d3.select('#deletedCard').classed('d-none', false)
            }

            this.saveEnabled = true
            if (needToDelete) {
                this.saveSemesters()
                delete localStorage["Custom-" + this.malla.currentMalla + "_SEMESTRES"]
            }
        }
    }
}
class MallaEditor {
    constructor(semesterManager, customSubjectLocation, categoryLocation = false) {
        // This constructor is bananas
        this.semesterManager = semesterManager
        this.customManager = document.querySelector(customSubjectLocation)
        this.categories = Object.assign({}, this.semesterManager.malla.categories)
        this.categoryList = {}
        this.subjectList = []
        this.tableList = {}
        this.defaultSector = ["#000000", "Fuera de la malla | editado"]
        this.categories["Custom"] = this.defaultSector

        if (categoryLocation) {
            document.getElementById("deleteCategories").addEventListener("click", this.restoreCategories.bind(this))
            this.categoryManager = document.querySelector(categoryLocation)
            let showModalButton = document.querySelector("#showCatModal")
            showModalButton.addEventListener("click", this.setUpCategoryModal.bind(this, false, null))
            let categoryModalId = showModalButton.getAttribute("data-target")
            this.createCatEventListener = this.createCategory.bind(this, null)
            this.editCatEventListener = null
            this.deleteCatEventListener = null
            this.categoryModal = $(categoryModalId)
            this.categoryModal.on("hidden.bs.modal", e => {
                e.target.querySelector("#cat-name").value = ""
                e.target.querySelector("#small-cat-name").value = ""
                e.target.querySelector("#small-cat-name").removeAttribute("disabled")
                e.target.querySelector("#cat-color").value = ""
                console.log("hidden")
                e.target.querySelector("#sectorDeleteButton").classList.remove("d-none")
                e.target.querySelector("#sectorDeleteButton").removeEventListener("click", this.deleteCatEventListener)
                let doneButton = e.target.querySelector("#sectorDoneButton")
                doneButton.removeEventListener("click", this.createCatEventListener)
                doneButton.removeEventListener("click", this.editCatEventListener)
                doneButton.textContent = "Agregar"
                e.target.querySelector("#catTitle").textContent = "Agregar"

            })

        } else
            this.categoryManager = null

        this.subjectTable = this.customManager.querySelector("#customTableContent")

        let creatorModalId = this.customManager.getElementsByClassName("button-create-subject")[0]
            .getAttribute("data-target")

        this.createSubjectModal = $(creatorModalId)
        this.createSubjectModal.on("hidden.bs.modal", e => {
            e.target.querySelector("#custom-name").value = ""
            e.target.querySelector("#custom-sigla").value = ""
            e.target.querySelector("#custom-credits-USM").value = ""
            e.target.querySelector("#custom-credits-SCT").value = ""
            e.target.querySelector("#custom-credits-SCT").placeholder = "Ingrese un valor"
        })

        this.createAdvancedSubjectModal = null

        let modal = document.querySelector(creatorModalId)
        modal.querySelector("#createSubject")
            .addEventListener("click", e => {
                this.createSubject(modal)
            })

        document.getElementById("deleteSubjects").addEventListener("click", this.cleanSubjects.bind(this))

        let advanced =this.customManager.getElementsByClassName("button-advanced-subject")

        if (advanced.length !== 0) {
            this.createSubEventListener = this.createAdvancedSubject.bind(this)
            this.editSubEvent = null
            this.advanced = true
            let advancedCreatorModalId = advanced[0]
                .getAttribute("data-target")
            this.createAdvancedSubjectModal = $(advancedCreatorModalId)
            advanced[0].addEventListener("click", () => {this.setUpModal()})
            this.createAdvancedSubjectModal.on("hidden.bs.modal", e => {
                e.target.querySelector("#custom-namea").value = ""
                let sigla = e.target.querySelector("#custom-siglaa")
                sigla.value = ""
                sigla.removeAttribute("disabled")
                e.target.querySelector("#custom-creditsa-USM").value = ""
                e.target.querySelector("#custom-creditsa-SCT").value = ""
                e.target.querySelector("#custom-creditsa-SCT").placeholder = "Ingrese un valor"
                e.target.querySelector("#dictatesIn").value = ""
                let sectorC = e.target.querySelector("#sectorChooser")
                sectorC.textContent = ""
                let defaultSector = document.createElement("option")
                defaultSector.value = this.defaultSector[0]
                sectorC.append(defaultSector)

                let prerC = e.target.querySelector("#prerChooser")
                prerC.textContent = ""
                let choosePrer = document.createElement("option")
                choosePrer.value = "0"
                choosePrer.textContent = "Elige los prerrequisitos"
                prerC.append(choosePrer)
                e.target.querySelector("#prerList").textContent = ""
                let doneButton = e.target.querySelector("#createAdvSubject")
                doneButton.textContent = "Agregar"
                doneButton.removeEventListener("click", this.createSubEventListener)
                doneButton.removeEventListener("click", this.editSubEvent)
                this.createAdvancedSubjectModal.get(0).querySelector("#advSubjectTitle").textContent = "Agregar"
            })
            let prerChooser = this.createAdvancedSubjectModal.get(0).querySelector("#prerChooser")
            prerChooser.addEventListener("change", this.addPrerToModal.bind(this))
        } else
            this.advanced = false

        this.subjectModalPrer = new Set()
    }

    // prepara el modal para agregar o editar asignaturas
    setUpModal(isEdit = false, subject=null) {
        let modal = this.createAdvancedSubjectModal.get(0)
        let sectorChooser = modal.querySelector("#sectorChooser")
        Object.keys(this.categories).forEach(category => {
            if (category !== "Custom") {
                let option = document.createElement("option")
                option.value = category
                option.textContent = this.categories[category][1]
                sectorChooser.append(option)
            }
        })
        if (this.categories["Custom"])
            sectorChooser.firstElementChild.textContent = this.categories["Custom"][1]
        else
            sectorChooser.firstElementChild.textContent = this.defaultSector[1]
        let prerChooser = modal.querySelector("#prerChooser")
        Object.keys(this.semesterManager.malla.ALLSUBJECTS).forEach(sigla => {
            let option = document.createElement("option")
            option.value = sigla
            option.textContent = this.semesterManager.malla.ALLSUBJECTS[sigla].name + " | " + sigla
            prerChooser.append(option)
        })
        this.subjectModalPrer = new Set()
        if (isEdit) {
            modal.querySelector("#custom-namea").value = subject.name
            let sigla = modal.querySelector("#custom-siglaa")
            sigla.value = subject.sigla
            sigla.setAttribute("disabled", "disabled")
            modal.querySelector("#custom-creditsa-USM").value = subject.getUSMCredits()
            if (Math.round(subject.getUSMCredits() * 5 / 3) !== subject.getSCTCredits())
                modal.querySelector("#custom-creditsa-SCT").value = subject.getSCTCredits()
            sectorChooser.value = subject.category
            subject.prer.forEach(sigla => {
                prerChooser.value = sigla
                this.addPrerToModal(null, prerChooser)
            })
            modal.querySelector("#dictatesIn").value = subject.dictatesIn
            if (this.tableList[subject.sigla])
                this.editSubEvent = this.tableList[subject.sigla][1]
            else
                this.editSubEvent = this.editSubject.bind(this, subject)
            this.createAdvancedSubjectModal.get(0).querySelector("#createAdvSubject").textContent = "Editar"
            this.createAdvancedSubjectModal.get(0).querySelector("#advSubjectTitle").textContent = "Editar"
            this.createAdvancedSubjectModal.get(0).querySelector("#createAdvSubject")
                .addEventListener("click", this.editSubEvent)
            this.createAdvancedSubjectModal.modal("show")
        } else {
            this.createAdvancedSubjectModal.get(0).querySelector("#createAdvSubject")
                .addEventListener("click", this.createSubEventListener)

        }
    }

    // Subject related

    // Muestra la asignatura en la tabla
    displaySubject(subject) {
        let fadeIn = [
            {opacity: 0},
            {opacity: 1}
        ]

        let subjectInfo = document.createElement("tr")
        subjectInfo.setAttribute("id", "custom-" + subject.sigla)
        let subjectRow = document.createElement("td")
        subjectRow.setAttribute("scope", "row")
        subjectRow.textContent = subject.sigla
        let subjectNameCol = document.createElement("td")
            subjectNameCol.textContent = subject.name
        let subjectCreditsCol = document.createElement("td")
            subjectCreditsCol.textContent = subject.getUSMCredits() + " USM | " + subject.getSCTCredits() + " SCT"
        let subjectState = document.createElement("td")
        subjectState.setAttribute("id", "state")
        if (subject.selected) {
            subjectState.textContent = "Seleccionado"
        } else {
            subjectState.textContent = "No seleccionado"
        }
        let subjectPrer = null
        if (this.advanced) {
            subjectPrer = document.createElement("td")
            let i = 0
            subject.prer.forEach(prer => {
                if (i === 0) {
                    subjectPrer.textContent = prer
                    i = 1
                } else
                    subjectPrer.textContent += " | " + prer
            })
            if (subjectPrer.textContent.length === 0)
                subjectPrer.textContent = "Sin prerrequisitos"
        }

        let actionsCol = document.createElement("td")
        actionsCol.classList.add("py-0")
        let actions = document.createElement("div")
        actions.classList.add("btn-group")
        actions.setAttribute("role", "group")
        let selectButton = document.createElement("button")
        selectButton.setAttribute("id", "sel-" + subject.sigla)
        selectButton.setAttribute("type", "button")
        selectButton.classList.add("btn", "btn-secondary")
        selectButton.textContent = "Seleccionar"
        selectButton.addEventListener("click", e => {
            subject.selectRamo()
            this.updateState(subject)
        })
        if(subject.selected)
            selectButton.textContent = "Deseleccionar"
        actions.append(selectButton)
        let editButton = null
        let editCatEventListener = null
        if (this.advanced) {
            editButton = document.createElement("button")
            editButton.setAttribute("type", "button")
            editButton.classList.add("btn", "btn-secondary")
            editButton.textContent = "Editar"
            editCatEventListener = this.editSubject.bind(this, subject)
            editButton.addEventListener("click", this.setUpModal.bind(this, true, subject))
            actions.append(editButton)
        }

        if (subject.isCustom) {
            let deleteButton = document.createElement("button")
            deleteButton.setAttribute("id", "delete-" + subject.sigla)
            deleteButton.classList.add("btn", "btn-danger")
            deleteButton.textContent = "Eliminar"
            deleteButton.addEventListener("click", e => {this.deleteSubject(subject)})
            actions.appendChild(deleteButton)
        } else {
            let restoreButton = document.createElement("button")
            restoreButton.setAttribute("id", "restore-" + subject.sigla)
            restoreButton.classList.add("btn", "btn-danger")
            restoreButton.textContent = "Restaurar"
            restoreButton.addEventListener("click", e => {this.restoreSubject(subject)})
            actions.appendChild(restoreButton)
        }
        actionsCol.append(actions)

        subjectInfo.append(subjectRow)
        subjectInfo.append(subjectNameCol)
        subjectInfo.append(subjectCreditsCol)
        subjectInfo.append(subjectState)
        if (this.advanced)
            subjectInfo.append(subjectPrer)
        subjectInfo.append(actionsCol)
        subjectInfo.childNodes.forEach(x => x.classList.add("align-middle"))
        if (subjectInfo.animate)
            subjectInfo.animate(fadeIn, 500)

        this.subjectTable.append(subjectInfo)
        this.tableList[subject.sigla] = [subjectInfo, editCatEventListener]


    }

    // Elimina la asignatura de la tabla
    unDisplaySubject(subject) {
        this.subjectTable.querySelector("#custom-" + subject.sigla).remove()
        delete this.tableList[subject.sigla]
    }

    // Actualiza la asignatura en la tabla con nuevos datos
    updateState(subject) {
        if (!subject.isCustom) {
            if (!subject.beenEdited) {
                return;
            } else if (this.tableList[subject.sigla] === undefined) {
                this.displaySubject(subject)
                return
            }
        }
        let subjectRow = this.tableList[subject.sigla][0].childNodes
        subjectRow[1].textContent = subject.name
        subjectRow[2].textContent = subject.getUSMCredits() + " USM | " + subject.getSCTCredits() + " SCT"
        if (this.advanced) {
            let subjectPrer = subjectRow[4]
            subjectPrer.textContent = null
            let i = 0
            subject.prer.forEach(prer => {
                if (i === 0) {
                    subjectPrer.textContent = prer
                    i = 1
                } else
                    subjectPrer.textContent += " | " + prer
            })
            if (subjectPrer.textContent.length === 0)
                subjectPrer.textContent = "Sin prerrequisitos"
        }
        let subjectState = subjectRow[3]
        subjectState.textContent = "No seleccionado"
        if (subject.selected) {
            subjectState.textContent = "Seleccionado"
        //} else if () {
        } else {
            let i = true
            Object.keys(this.semesterManager.selectedPerSemester).forEach(semester => {
                if (semester !== this.semesterManager.semester) {
                    let found = this.semesterManager.selectedPerSemester[semester].indexOf(subject)
                    if (found !== -1){
                        if (semester < this.semesterManager.semester)
                        if (i) {
                            subjectState.textContent = "Seleccionado en S" + semester
                            i = false
                        } else {
                            subjectState.textContent += ", S" + semester
                        }
                    }
                }
            })
        }

        let subjectSelButton = this.tableList[subject.sigla][0].querySelector("#sel-" + subject.sigla)
        if (subject.selected) {
            subjectSelButton.textContent = "Deseleccionar"
        } else
            subjectSelButton.textContent = "Seleccionar"

        if (!subject.approved) {
            subjectSelButton.removeAttribute("disabled")
        } else {
            subjectSelButton.setAttribute("disabled", "disabled")
        }

    }

    updateAllStates() {
        this.subjectList.forEach(subject => this.updateState(subject))
    }

    // Como actuar cuando se cambia de semestre
    semesterChange() {
        this.subjectList.forEach(subject => {
            this.updateState(subject)
        })
    }

    // Crea la asignatura a partir del modal
    createSubject(modal) {
        let name = modal.querySelector("#custom-name").value
        let sigla = modal.querySelector("#custom-sigla").value
        let creditsUSM = parseInt(modal.querySelector("#custom-credits-USM").value)
        let creditsSCT = parseInt(modal.querySelector("#custom-credits-SCT").value)
        if (isNaN(creditsSCT))
            creditsSCT = 0
        let prer = []


        let sectorName = "Custom"

        let subject = new SelectableRamo(name, sigla, creditsUSM, sectorName, prer, this.semesterManager.malla.SUBJECTID++, this.semesterManager.malla, creditsSCT ,true)
        this.subjectList.push(subject)
        this.semesterManager.malla.addSubject(subject)
        this.displaySubject(subject)
        this.saveSubjects()

        if (this.advanced) {
            this.saveCategories()
        }
    }

    // Crea la asignatura a partir del modal
    createAdvancedSubject() {
        let modal = this.createAdvancedSubjectModal.get(0)
        let name = modal.querySelector("#custom-namea").value
        let sigla = modal.querySelector("#custom-siglaa").value
        let creditsUSM = modal.querySelector("#custom-creditsa-USM").value
        let creditsSCT = modal.querySelector("#custom-creditsa-SCT").value
        if (isNaN(parseInt(creditsUSM))) {
            creditsUSM = 1
        } else
            creditsSCT = parseInt(creditsUSM)
        if (isNaN(parseInt(creditsSCT)))
            creditsSCT = 2
        else
            creditsSCT = parseInt(creditsSCT)

        console.log(creditsSCT, creditsUSM, modal.querySelector("#custom-creditsa-USM").value)
        let sectorName = modal.querySelector('#sectorChooser').value;
        let dictatesIn = modal.querySelector('#dictatesIn').value;
        let prer = []
        modal.querySelector("#prerList").querySelectorAll("li").forEach(item => {
            prer.push(item.getAttribute("id").slice(4))
        })
        let subject = new SelectableRamo(name, sigla, creditsUSM, sectorName, prer, this.semesterManager.malla.SUBJECTID++, this.semesterManager.malla, creditsSCT ,true, dictatesIn)
        this.subjectList.push(subject)
        this.semesterManager.malla.addSubject(subject)
        this.createAdvancedSubjectModal.modal("hide")
        this.displaySubject(subject)
        this.saveSubjects()

    }

    // Edita la asignatura a partir del modal
    editSubject(subject) {
        let modal = this.createAdvancedSubjectModal.get(0)
        subject.name = modal.querySelector("#custom-namea").value
        subject.category = modal.querySelector("#sectorChooser").value
        subject.prer = new Set(this.subjectModalPrer)
        subject.dictatesIn = modal.querySelector('#dictatesIn').value;

        let creditsUSM = modal.querySelector("#custom-creditsa-USM").value
        let creditsSCT = modal.querySelector("#custom-creditsa-SCT").value
        if (creditsSCT.length === 0)
            creditsSCT = null
        subject.updateCredits(creditsUSM, creditsSCT)
        subject.verifyPrer()
        if (!subject.beenEdited)
            this.subjectList.push(subject)
        subject.beenEdited = true
        this.updateState(subject)
        this.semesterManager.updateDisplayedSubject(subject)
        this.saveSubjects()

    }

    // Elimina asignaturas creadas
    deleteSubject(subject) {
        if (subject.selected)
            subject.selectRamo()
        this.semesterManager.removeSubjectOutsideSemester(subject)
        this.unDisplaySubject(subject)


        let i = this.subjectList.indexOf(subject)
        if (i > -1) {
            this.subjectList.splice(i, 1);
            this.semesterManager.malla.delSubjects(subject)
        }
        this.saveSubjects()

    }

    restoreSubject(subject) {
        // revisa en malla.rawMalla los datos originales del ramo y los usa
        // se quita el ramo de la tabla y también si esta seleccionado, se actualiza ahi también
        // si la categoría original esta borrada, se recrea
        Object.values(this.semesterManager.malla.rawMalla).forEach(subjectList => {
            for(let rawSubject of subjectList) {
                if (rawSubject[1] === subject.sigla) {
                    subject.name = rawSubject[0]
                    subject.updateCredits(rawSubject[2], rawSubject[3])
                    subject.category = rawSubject[4]
                    subject.prer = new Set(rawSubject[5])
                    subject.dictatesIn = rawSubject[6]

                    if (subject.selected)
                        this.semesterManager.updateDisplayedSubject(subject)

                    if (JSON.stringify(this.categories[rawSubject[4]]) !== JSON.stringify(this.semesterManager.malla.categories[rawSubject[4]])) {
                        this.restoreCategory(rawSubject[4])
                    }
                    this.unDisplaySubject(subject)
                    let i = this.subjectList.indexOf(subject)
                    if (i > -1)
                        this.subjectList.splice(i, 1);
                    this.saveSubjects()
                }
            }
        })
    }

    cleanSubjects() {
        let listToClean = [...this.subjectList]
        listToClean.forEach(subject => {
            if (subject.isCustom)
                this.deleteSubject(subject)
            else
                this.restoreSubject(subject)
        })
        // se borran todos los ramos y se restauran los que lo necesiten
    }

    saveSubjects() {
        let cache = {}
        this.subjectList.forEach(subject => {
            cache[subject.sigla] = [subject.name, subject.getUSMCredits(), subject.category, [...subject.prer]]
            if (subject.USMtoSCT)
                cache[subject.sigla].push(0)
            else
                cache[subject.sigla].push(subject.getSCTCredits())
            cache[subject.sigla].push(subject.dictatesIn)
        })
        cache = JSON.stringify(cache)
        if (this.advanced) {
            localStorage["generatorUserSubjects" + this.semesterManager.malla.currentMalla] = cache
        } else {
            localStorage["priorixUserSubjects" + this.semesterManager.malla.currentMalla] = cache
        }
    }

    loadSubjects() {
        let cache
        if (this.advanced){
            cache = localStorage["generatorUserSubjects" + this.semesterManager.malla.currentMalla]
        } else {
            cache = localStorage["priorixUserSubjects" + this.semesterManager.malla.currentMalla]
        }
        if (cache === undefined) {
            // Si no encuentra nuevo cache, se busca el cache antiguo
            this.loadOldSubjects()
            return
        }
        cache = JSON.parse(cache)
        //console.log(cache)
        let prersNotFound = {}
        Object.keys(cache).forEach(sigla => {
            let data = cache[sigla]
            if (this.semesterManager.malla.ALLSUBJECTS[sigla] === undefined) {
                data[3] = data[3].filter(prer => {
                    if (this.semesterManager.malla.ALLSUBJECTS[prer] === undefined) {
                        if (prersNotFound[prer] === undefined) {
                            prersNotFound[prer] = []
                        }
                        prersNotFound[prer].push(sigla)
                        return false
                    }
                    return true
                })
                let subject = new SelectableRamo(data[0], sigla, data[1], data[2], data[3],
                    this.semesterManager.malla.SUBJECTID++, this.semesterManager.malla, data[4], true, 6 === data.length ? data[5] : "")
                this.semesterManager.malla.addSubject(subject)
                this.subjectList.push(subject)
                this.displaySubject(subject)
            } else {
                let subject = this.semesterManager.malla.ALLSUBJECTS[sigla]
                subject.name = data[0]
                subject.updateCredits(data[1], data[4])
                subject.category = data[2]
                subject.prer = new Set(data[3])
                subject.beenEdited = true
                this.subjectList.push(subject)
                this.updateState(subject)
            }
        })
        if (Object.keys(prersNotFound).length !== 0) {
            let toast = $('.toast')
            toast.toast('show')
            toast.css("zIndex","3")
            let list = d3.select('#deletedSubjects').append('ul')
            Object.keys(prersNotFound).forEach(prer => {
                let nestedList = list.append('li').text(`Ramos que tenían a ${prer} como prerrequisito`).append('ul')
                prersNotFound[prer].forEach(subject => {
                    nestedList.append('li').text(subject)
                })
            })
            d3.select('#deletedCard').classed('d-none', false)
        }

    }

    loadOldSubjects() {
        let cache
        if (this.advanced){
            cache = localStorage["Custom-" + this.semesterManager.malla.currentMalla + "_CUSTOM"]
            if (cache) {
                let prersNotFound = {}

                let customSubjects = JSON.parse(cache);

                for (let sigla in customSubjects) {
                    // inicializar ramos fuera de malla
                    let data = customSubjects[sigla];
                    let prer = [];
                    if (data.length === 6) {
                        prer = data[5]
                    } else if (!(data[4] != [])) {
                        prer = data[4]
                    }
                    prer = prer.filter(prer => {
                        if (this.semesterManager.malla.ALLSUBJECTS[prer] === undefined) {
                            if (prersNotFound[prer] === undefined) {
                                prersNotFound[prer] = []
                            }
                            prersNotFound[prer].push(sigla)
                            return false
                        }
                        return true
                    })


                    if (this.semesterManager.malla.ALLSUBJECTS[sigla] === undefined) {
                        let subject = new this.semesterManager.malla.subjectType(data[0], data[1], data[2], data[3], prer,
                            this.semesterManager.malla.SUBJECTID++, this.semesterManager.malla, 0, true);
                        this.semesterManager.malla.addSubject(subject)
                        this.subjectList.push(subject)
                        this.displaySubject(subject)
                    } else {
                        let subject = this.semesterManager.malla.ALLSUBJECTS[sigla]
                        subject.name = data[0]
                        subject.updateCredits(data[2])
                        subject.category = data[3]
                        subject.prer = prer
                        subject.beenEdited = true
                        this.updateState(subject)
                    }
                }
                delete localStorage["Custom-" + this.semesterManager.malla.currentMalla + "_CUSTOM"]
                if (Object.keys(prersNotFound).length !== 0) {
                    let toast = $('.toast')
                    toast.toast('show')
                    toast.css("zIndex","3")
                    let list = d3.select('#deletedSubjects').append('ul')
                    Object.keys(prersNotFound).forEach(prer => {
                        let nestedList = list.append('li').text(`Ramos que tenían a ${prer} como prerrequisito`).append('ul')
                        prersNotFound[prer].forEach(subject => {
                            nestedList.append('li').text(subject)
                        })
                    })
                    d3.select('#deletedCard').classed('d-none', false)
                }

            }
        } else {
            // prioridad
            cache = localStorage["prioridad-" + this.semesterManager.malla.currentMalla + "_CUSTOM"]
            if (cache) {
                cache = JSON.parse(cache);

                for (let sigla in cache) {
                    // inicializar ramos fuera de malla
                    let customSubject = cache[sigla];
                    let subject = new this.semesterManager.malla.subjectType(customSubject[0],customSubject[1],
                        customSubject[2],customSubject[3],[],this.semesterManager.malla.SUBJECTID++,
                        this.semesterManager.malla, 0,true);
                    this.semesterManager.malla.addSubject(subject)
                    this.subjectList.push(subject)
                    this.displaySubject(subject)
                }
                delete localStorage["prioridad-" + this.semesterManager.malla.currentMalla + "_CUSTOM"]
            }
        }
        this.saveSubjects()
    }

    addPrerToModal(e, prerChooser = null){
        let selector = null
        if (prerChooser)
            selector = prerChooser
        else
            selector = e.target

        let selectedOption= selector.selectedOptions[0]
        if (selectedOption.value !== 0) {
            let arText = selectedOption.textContent.split(" | ")
            this.subjectModalPrer.add(selectedOption.value)
            selectedOption.setAttribute("disabled", "disabled")
            let prer = document.createElement("li")
            prer.setAttribute("id", "pre-" + arText[1])
            prer.classList.add("list-group-item", "d-flex", "align-items-center", "pr-0", "py-0")
            let text = document.createElement("div")
            text.classList.add("flex-grow-1")
            text.textContent = arText.reverse().join(" | ")
            let delBtn = document.createElement("button")
            delBtn.classList.add("btn", "btn-danger")
            delBtn.setAttribute("type", "button")
            delBtn.textContent = "Quitar"
            delBtn.addEventListener("click", () => {
                this.subjectModalPrer.delete(selectedOption.value)
                selectedOption.removeAttribute("disabled")
                prer.remove()
            })
            prer.append(text)

            prer.append(delBtn)
            this.createAdvancedSubjectModal.get(0).querySelector("#prerList").append(prer)
        }
        selector.firstElementChild.setAttribute("selected", true)
    }

    // Category related

    // Llenado inicial de la tabla de categorías
    fillCategories() {
        Object.keys(this.categories).forEach(category => {
            this.displayCategory(category)
        })
    }

    // Se explica solo
    createCategory(catData = null) {
        let categorySN, name, color
        if (catData) {
            name = catData['name']
            categorySN = catData['categorySN']
            color = catData["color"]
        } else {
            let modal = this.categoryModal.get(0)
            name = modal.querySelector("#cat-name").value
            categorySN = modal.querySelector("#small-cat-name").value
            color = modal.querySelector("#cat-color").value
            this.categoryModal.modal("hide")
        }
        this.categories[categorySN] = [color, name]
        this.displayCategory(categorySN)
        this.saveCategories()
    }

    // Se explica solo
    editCategory(category, catData = null) {
        if (catData) {
            this.categories[category][0] = catData["color"]
            this.categories[category][1] = catData["name"]

        } else {
            let modal = this.categoryModal.get(0)
            this.categories[category][0] = modal.querySelector("#cat-color").value
            this.categories[category][1] = modal.querySelector("#cat-name").value
        }
        this.updateCategory(category)
        this.saveCategories()
    }

    deleteCategory(categorySN) {
        // se recorren todos los ramos y si pertenecen a esa categoria se cambia a Custom
        // luego se elimina la categoría
        this.categoryList[categorySN].remove()
        delete this.categoryList[categorySN]
        delete this.categories[categorySN]
        Object.values(this.semesterManager.malla.ALLSUBJECTS).forEach(subject => {
            if (subject.category === categorySN) {
                subject.category = "Custom"
                subject.beenEdited = true
                this.subjectList.push(subject)
                this.updateState(subject)
            }
        })
        this.saveSubjects()
        this.saveCategories()
    }

    restoreCategory(categorySN = "Custom", a=null) {
        let data = {"categorySN" : categorySN}
        if (categorySN === "Custom") {
            data["name"] = this.defaultSector[1]
            data["color"] = this.defaultSector[0]
        } else {
            data["name"] = this.semesterManager.malla.categories[categorySN][1]
            data["color"] = this.semesterManager.malla.categories[categorySN][0]
        }
        if (this.categories[categorySN] === undefined)
            this.createCategory(data)
        else
            this.editCategory(categorySN, data)
    }

    restoreCategories() {
        // se eliminan los ramos no originales y se recrean lo originales borrados
        // no se editan las categorías de los ramos
        let categories =  this.semesterManager.malla.categories
        Object.keys(this.categories).forEach(category =>{
            if (categories[category] === undefined)
                this.deleteCategory(category)
        })
        Object.keys(categories).forEach(category => {
            this.restoreCategory(category)
        })
        this.restoreCategory("Custom")

    }

    setUpCategoryModal(isEdit=false, category="Custom") {
        if (isEdit) {
            let modal = this.categoryModal.get(0)
            modal.querySelector("#cat-name").value = this.categories[category][1]
            let categorySN = modal.querySelector("#small-cat-name")
            categorySN.value = category
            categorySN.setAttribute("disabled", true)
            modal.querySelector("#cat-color").value = this.categories[category][0]
            this.editCatEventListener = this.editCategory.bind(this, category, null)
            this.deleteCatEventListener = this.deleteCategory.bind(this, category)
            if (category === "Custom") {
                modal.querySelector("#sectorDeleteButton").classList.add("d-none")
            } else {
                modal.querySelector("#sectorDeleteButton")
                    .addEventListener("click", this.deleteCatEventListener)
            }
            modal.querySelector("#sectorDoneButton")
                .addEventListener("click", this.editCatEventListener)
            modal.querySelector("#catTitle").textContent = "Editar"
            modal.querySelector("#sectorDoneButton").textContent = "Editar"

            this.categoryModal.modal("show")
        } else {
            this.categoryModal.get(0).querySelector("#sectorDeleteButton").classList.add("d-none")
            this.categoryModal.get(0).querySelector("#sectorDoneButton")
                .addEventListener("click", this.createCatEventListener)
        }
    }

    // Se explica solo
    displayCategory(categorySN) { // ShortName
        let category = document.createElement("button")
        category.classList.add("list-group-item",
            "list-group-item-action",
            "sector")

        let color = this.categories[categorySN][0]
        if (this.needsWhiteText(color))
            category.classList.add("text-white")

        category.setAttribute("type", "button")
        category.setAttribute("id", "cat-" + categorySN)
        category.style.backgroundColor = color
        category.textContent = this.categories[categorySN][1]
        category.addEventListener("click", this.setUpCategoryModal.bind(this, true, categorySN))
        this.categoryManager.append(category)
        this.categoryList[categorySN] = category
    }

    // Actualiza la categoría según la edición del usuario
    updateCategory(categorySN) {
        let category = this.categoryList[categorySN]
        category.style.backgroundColor = this.categories[categorySN][0]
        if (this.needsWhiteText(this.categories[categorySN][0]))
            category.classList.add("text-white")
        else
            category.classList.remove("text-white")
        category.textContent = this.categories[categorySN][1]
    }

    saveCategories() {
        localStorage["generatorUserCategory" + this.semesterManager.malla.currentMalla] = JSON.stringify(this.categories)
    }

    loadCategories() {
        let cache = localStorage["generatorUserCategory" + this.semesterManager.malla.currentMalla]
        if (cache) {
            cache = JSON.parse(cache)
            //console.log(this.categoryManager.children)
            this.categories = cache
        } else {
            this.loadOldCategories()
        }
        this.fillCategories()
    }

    loadOldCategories() {
        let cache = localStorage["Custom-" + this.semesterManager.malla.currentMalla + "_SECTORS"]
        if (cache) {
            cache = JSON.parse(cache)
            //console.log(this.categoryManager.children)
            Object.keys(cache).forEach(categorySN => {
                this.categories[categorySN] = cache[categorySN]
            })
            //delete localStorage["Custom-" + this.semesterManager.malla.currentMalla + "_SECTORS"]
            this.saveCategories()
            delete localStorage["Custom-" + this.semesterManager.malla.currentMalla + "_CUSTOM"]
        }
    }

    // Retorna un booleano dependiendo si el hex entregado contrasta mejor con blanco
    needsWhiteText(colorHex) {
        // Convert hex to RGB first
        let r = 0, g = 0, b = 0;
        if (colorHex.length === 4) {
            r = "0x" + colorHex[1] + colorHex[1];
            g = "0x" + colorHex[2] + colorHex[2];
            b = "0x" + colorHex[3] + colorHex[3];
        } else if (colorHex.length === 7) {
            r = "0x" + colorHex[1] + colorHex[2];
            g = "0x" + colorHex[3] + colorHex[4];
            b = "0x" + colorHex[5] + colorHex[6];
        }
        // console.log(r,g,b)
        // Then to HSL
        let rgb = [0, 0, 0];
        rgb[0] = r / 255;
        rgb[1] = g / 255;
        rgb[2] = b / 255;

        for (let color in rgb) {
            if (rgb[color] <= 0.03928) {
                rgb[color] /= 12.92
            } else {
                rgb[color] = Math.pow(((rgb[color] + 0.055) / 1.055), 2.4)
            }

        }

        // c <= 0.03928 then c = c/12.92 else c = ((c+0.055)/1.055) ^ 2.4
        let l = 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
        // console.log(l)
        return l <= 0.6; // este valor deberia ser mas bajo según estandares...
    }

}