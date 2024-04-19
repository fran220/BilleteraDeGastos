const formulario = document.getElementById('agregar-gasto');
const gastosListado = document.querySelector('#gastos ul');


eventListeners();
function eventListeners() {
    document.addEventListener('DOMContentLoaded', preguntarPresupuesto);
    formulario.addEventListener('submit', agregarGasto);
    gastosListado.addEventListener('click', eliminarGasto);
}

// Classes
class Presupuesto {
    constructor(presupuesto) {
        this.presupuesto = Number(presupuesto);
        this.restante = Number(presupuesto);
        this.gastos = [];
    }

    nuevoGasto(gasto) {
        this.gastos = [...this.gastos, gasto];
        this.calcularRestante();
    }

    eliminarGasto(id) {
        this.gastos = this.gastos.filter( gasto => gasto.id.toString() !== id );
        this.calcularRestante();
    }

    calcularRestante() {
        const gastado = this.gastos.reduce((total, gasto) => total + gasto.cantidad, 0);
        this.restante = this.presupuesto - gastado;
    }
}

class UI {

    insertarPresupuesto( cantidad ) {
        document.querySelector('#total').textContent = cantidad.presupuesto;
        document.querySelector('#restante').textContent = cantidad.restante;
    }
    
    imprimirAlerta(mensaje, tipo) {
        const divMensaje = document.createElement('div');
        divMensaje.classList.add('text-center', 'alert');

        if(tipo === 'error') {
             divMensaje.classList.add('alert-error');
        } else {
             divMensaje.classList.add('alert-success');
        }
        
        divMensaje.textContent = mensaje;

        document.querySelector('.primario').insertBefore(divMensaje, formulario);

        setTimeout( () => {
             document.querySelector('.primario .alert').remove();
        }, 3000);
    }

    // Inserta los gastos a la lista 
    agregarGastoListado(gastos) {

        this.limpiarHTML();

        gastos.forEach(gasto => {
            const {nombre, cantidad, id} = gasto;

            const nuevoGasto = document.createElement('li');
            nuevoGasto.className = 'list';
            nuevoGasto.dataset.id = id;

            nuevoGasto.innerHTML = `
                <p>${nombre}</p>
                <span class="precio-style">$ ${cantidad}</span>
            `;

            const btnBorrar = document.createElement('button');
            btnBorrar.classList.add('btn', 'btn-borrar','borrar-gasto');
            btnBorrar.textContent = 'Borrar';
            nuevoGasto.appendChild(btnBorrar);

            gastosListado.appendChild(nuevoGasto);
        });
    }

     // Comprueba el presupuesto restante
    actualizarRestante(restante) {
        document.querySelector('#restante').textContent = restante; 
    }

     // Cambia de color el presupuesto restante
     comprobarPresupuesto(presupuestoObj) {
        const {presupuesto, restante} = presupuestoObj;
        const restanteDiv = document.querySelector('.restante');
        const btn = formulario.querySelector('button[type="submit"]');

        if( (presupuesto / 4) > restante) {
            restanteDiv.classList.remove('alert-success', 'alert-warning');
            restanteDiv.classList.add('alert-error');
        } else if( (presupuesto / 2) > restante) {
            restanteDiv.classList.remove('alert-success', 'alert-danger');
            restanteDiv.classList.add('alert-warning');
        } else if((presupuesto / 2) < restante){
            restanteDiv.classList.remove('alert-danger', 'alert-warning');
            restanteDiv.classList.add('alert-success');
        }

        // Si presupuesta es igual a 0 
        if(restante <= 0 ) {
            ui.imprimirAlerta('El presupuesto se ha agotado', 'error');
            btn.disabled = true
            btn.classList.add('opacity');
        }
        if(restante > 0){
            btn.disabled = false;
            btn.classList.remove('opacity');
        }
    }

    limpiarHTML() {
        while(gastosListado.firstChild) {
            gastosListado.removeChild(gastosListado.firstChild);
        }
    }
}

const ui = new UI();
let presupuesto;

function preguntarPresupuesto() {
    const presupuestoUsuario = prompt('¿Cual es tu presupuesto?');

    if( presupuestoUsuario === '' || presupuestoUsuario === null || isNaN(presupuestoUsuario) || presupuestoUsuario <= 0 ) {
        window.location.reload();
    }

    presupuesto = new Presupuesto(presupuestoUsuario);

    ui.insertarPresupuesto(presupuesto)
}

function agregarGasto(e) {
    e.preventDefault();

     
    const nombre = document.querySelector('#gasto').value;
    const cantidad = Number( document.querySelector('#cantidad').value);

    if(nombre === '' || cantidad === '') {
        ui.imprimirAlerta('Ambos campos son obligatorios', 'error');
    } else if(cantidad <= 0 || isNaN(cantidad )) {
        ui.imprimirAlerta('Cantidad no válida', 'error')
    } else {
        const gasto = { nombre, cantidad, id: Date.now() };

        presupuesto.nuevoGasto(gasto)

        ui.imprimirAlerta('Correcto', 'correcto');

        const {gastos} = presupuesto;
        ui.agregarGastoListado(gastos);

        ui.comprobarPresupuesto(presupuesto);

        const {restante} = presupuesto;
        ui.actualizarRestante(restante)

        formulario.reset();
    }
}

function eliminarGasto(e) {
    if(e.target.classList.contains('borrar-gasto')){
        const {id} = e.target.parentElement.dataset;
        presupuesto.eliminarGasto(id);
        
        ui.comprobarPresupuesto(presupuesto);

        const {restante} = presupuesto;
        ui.actualizarRestante(restante);

        e.target.parentElement.remove();
    } 
}