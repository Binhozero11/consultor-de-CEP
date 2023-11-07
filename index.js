const form = document.getElementById("form")
const res = document.getElementById("resultado")
const button= document.querySelector("button[type='submit']")

async function consultarCep(cep) {
    //
    try {
        const resultado = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
        method: "GET",
    })

    if (resultado.ok) {
        const body = await resultado.json()

        if(body ===undefined)
           return undefined

        const {cep, logradouro, complemento , bairro, localidade, uf, ibge, ddd, erro }
         = body

        if(erro) {
            return undefined  
        }

         if(cep===undefined){
            return undefined 
        }

        return {
            cep,
            logradouro,
            uf,
            complemento,
            bairro,
            localidade,
            ibge,
            ddd,
        }

       
    }
  

    }catch(e){
        throw new Error(`Algo deu errado, tente novamente, error: ${e.message}`)
    }
}
//     .then(resultado => {
//         if (resultado.status >= 400) {
//             return Promise.reject()    
//         }
//         return resultado.json()
//     })
//     .then(json => {

// const {cep, logradouro, complemento , bairro, localidade, uf, ibge, ddd } = json;

//         res.innerHTML = localidade
//     })
//     .catch(err => console.log(err))
//     .finally(function(){
//         res.classList.remove("spinner-border")
//     })
// }
function errorMessage(msg) {
    res.innerHTML= `<span class="message-error">${msg}</span>`
}

form.addEventListener("submit", async function(e) {
    try {
    e.preventDefault()
    button.disabled = true;

    

    const cepDigitado = e.target.cep.value;
    const validaCep = /^[0-9]{8}$/
    const isValido = validaCep.test(cepDigitado)
    res.innerHTML = ''
    if (!isValido) {
        errorMessage("CEP inválido")
        return;
    }
    
        res.classList.add("spinner-border")
        const resultado = await consultarCep(cepDigitado)
        if(resultado==undefined) {
            errorMessage(`Não conseguimos encontrar nenhuma informação com CEP ${cepDigitado} infromado`)
            return
        }
        console.log(resultado);
        res.innerHTML = resultado.localidade


    }catch(e){
        
    }finally{
        res.classList.remove("spinner-border")
        button.disabled = false;

    }
})