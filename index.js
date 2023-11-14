const form = document.getElementById("form")
const res = document.getElementById("resultado")
const button= document.querySelector("button[type='submit']")
const historico = document.getElementById("historico")

document.addEventListener('novo_cep_consultado', function(){
    meusUltimosCepConsultados();
})

meusUltimosCepConsultados()

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

function notificarCepConsultado(cep) {
    const event = new CustomEvent("novo_cep_consultado", { detail:  cep});
    document.dispatchEvent(event);
}

function salvarCepConsultado(cep){
    let ceps = cepsStorages()
    ceps.unshift(cep)
    localStorage.setItem("ceps", JSON.stringify(ceps))
    notificarCepConsultado(cep)
}

function cepsStorages() {
    let ceps = localStorage.getItem("ceps")
   
    if(ceps!=null){
        return JSON.parse(ceps)
    }

    localStorage.setItem("ceps", JSON.stringify([]))
    return [];
}

function meusUltimosCepConsultados() {
    let ceps = cepsStorages()
   
  
    historico.innerHTML = ""
    var index =0;
    for (const cep of ceps) {
        
        if(index>=5){
            break;
        }
        historico.innerHTML += `<p>${cep.localidade} ${cep.cep}</p>`
        index++
    }
       
    
}

function errorMessage(msg) {
    res.innerHTML= 
    `
        <span>
            <div class="message-error">${msg}</div>
        </span>
    `
}

function okMessage(msg) {
    res.innerHTML= 
    `
        <span>
            <ul class="message-ok">${msg}</ul>
        </span>
    `
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

    //existo do local sgora, se existe reroan ele

  
   
    const value = cepDigitado.replace(/\D/g, '');

    const ceps = cepsStorages()
    const valor = ceps.filter(cep=> cep.cep.replace(/\D/g, '') == value)
   if(valor.length>0){
   const resultado = valor[0]

   const uri = new URLSearchParams();
   uri.append("query", `${resultado.logradouro},${resultado.localidade}` )
  


   const url = `https://www.google.com/maps/search/?api=1&${uri.toString()}`

   okMessage(
    `
        <li>Local: <strong>${resultado.localidade.length > 0 ? resultado.localidade : "..."}</strong></li>
        <li>DDD: <strong>${resultado.ddd.length > 0 ? resultado.ddd : "..."}</strong></li>
        <li>Bairro: <strong>${resultado.bairro.length > 0 ? resultado.bairro : "..."}</strong></li>
        <li>Ibge: <strong>${resultado.ibge.length > 0 ? resultado.ibge : "..."}</strong></li>
        <li>Complemento: <strong>${resultado.complemento.length > 0 ? resultado.complemento : "..."}</strong></li>
        <li>Logradouro: <strong>${resultado.logradouro.length > 0 ? resultado.logradouro : "..."}</strong></li>
        <li>Uf: <strong>${resultado.uf.length > 0 ? resultado.uf : "..."}</strong></li>
        ${resultado.localidade.length>0 ? `    <li>
        <a target="_blank" href="${url}">Veja no mapa</a>
    </li>` : "" }`)
    return;
   }



    res.classList.add("spinner-border")
    const resultado = await consultarCep(value)

    if(resultado==undefined) {
        errorMessage(`Não conseguimos encontrar nenhuma informação com CEP ${cepDigitado} informado`)
        return
    }
    console.log('salvarCepConsultado', resultado)

    salvarCepConsultado(resultado)

    const uri = new URLSearchParams();
    uri.append("query", `${resultado.logradouro},${resultado.localidade}` )
   


    const url = `https://www.google.com/maps/search/?api=1&${uri.toString()}`

    okMessage(
    `
        <li>Local: <strong>${resultado.localidade.length > 0 ? resultado.localidade : "..."}</strong></li>
        <li>DDD: <strong>${resultado.ddd.length > 0 ? resultado.ddd : "..."}</strong></li>
        <li>Bairro: <strong>${resultado.bairro.length > 0 ? resultado.bairro : "..."}</strong></li>
        <li>Ibge: <strong>${resultado.ibge.length > 0 ? resultado.ibge : "..."}</strong></li>
        <li>Complemento: <strong>${resultado.complemento.length > 0 ? resultado.complemento : "..."}</strong></li>
        <li>Logradouro: <strong>${resultado.logradouro.length > 0 ? resultado.logradouro : "..."}</strong></li>
        <li>Uf: <strong>${resultado.uf.length > 0 ? resultado.uf : "..."}</strong></li>
        ${resultado.localidade.length>0 ? `    <li>
        <a target="_blank" href="${url}">Veja no mapa</a>
    </li>` : "" }
    
    `
    )


    }catch(e){
        
    }finally{
        res.classList.remove("spinner-border")
        button.disabled = false;

    }
})