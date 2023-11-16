const form = document.getElementById("form")
const res = document.getElementById("resultado")
const button = document.querySelector("button[type='submit']")
const historico = document.getElementById("historico")

document.addEventListener('novo_cep_consultado', function () {
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

            if (body === undefined)
                return undefined

            const { cep, logradouro, complemento, bairro, localidade, uf, ibge, ddd, erro }
                = body

            if (erro) {
                return undefined
            }

            if (cep === undefined) {
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

    } catch (e) {
        throw new Error(`Algo deu errado, tente novamente, error: ${e.message}`)
    }
}

function notificarCepConsultado(cep) {
    const event = new CustomEvent("novo_cep_consultado", { detail: cep });
    document.dispatchEvent(event);
}

function salvarCepConsultado(cep) {
    let ceps = cepsStorages()
    ceps.unshift(cep)
    localStorage.setItem("ceps", JSON.stringify(ceps))
    notificarCepConsultado(cep)
}

function cepsStorages() {
    let ceps = localStorage.getItem("ceps")

    if (ceps != null) {
        return JSON.parse(ceps)
    }

    localStorage.setItem("ceps", JSON.stringify([]))
    return [];
}

function meusUltimosCepConsultados() {
    let ceps = cepsStorages()
    historico.innerHTML = ""
    var index = 0;
    for (const cep of ceps) {
        if (index >= 5) {
            break;
        }
        const p = document.createElement('p')
        p.innerHTML = `${cep.localidade} ${cep.cep}`
        p.addEventListener('click', function () {
            tratadorCep(cep)
        })

        historico.appendChild(p)
        index++
    }


}

function errorMessage(msg) {
    res.innerHTML =
        `
        <span style="text-align: center;">
            <div class="message-error">${msg}</div>
        </span>
    `
}

function tratadorCep(resultado){
    const uri = new URLSearchParams();
    uri.append("query", `${resultado.logradouro},${resultado.localidade}`)
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
    ${resultado.localidade.length > 0 ? `    <li>
    <a target="_blank" href="${url}">Veja no mapa</a>
</li>` : ""}

`
    )

}

function okMessage(msg) {
    res.innerHTML =
        `
        <span>
            <ul class="message-ok">${msg}</ul>
        </span>
    `
}

function consultaCepNoStorage(valor){
    const ceps = cepsStorages()
    const ultimosCepConsultado = ceps.filter(cep => cep.cep.replace(/\D/g, '') == valor)
    if (ultimosCepConsultado.length > 0) {
        const resultado = ultimosCepConsultado[0]
       
        return resultado;
    }

    return undefined
} 

function cepValido(cep){
    const validaCep = /(^[0-9]{5}-[\d]{3})$|(^[0-9]{8})$/
    const isValido = validaCep.test(cep)
    return isValido
}

function removeCaracteresCep(cep) {
    const value = cep.replace(/\D/g, '');
    return value
}

function antesConsultarCep() {
    res.innerHTML = ''
    button.disabled = true;
    res.classList.add("spinner-border")
}

function aposcoNSULTAdOcEP() {
    res.classList.remove("spinner-border")
        button.disabled = false;
}

form.addEventListener("submit", async function (e) {

    try {
        e.preventDefault()
        antesConsultarCep();

        const cepDigitado = e.target.cep.value;
        const isValido= cepValido(cepDigitado)

    
        if (!isValido) {
            errorMessage("CEP inválido. </br>Ex: 46500-000 ou 46500000")
            return;
        }

        const value = removeCaracteresCep(cepDigitado);       

        const ultimoCepConsultado=  consultaCepNoStorage(value)
        
        if (ultimoCepConsultado!=undefined) {
            tratadorCep(ultimoCepConsultado)
            salvarCepConsultado(ultimoCepConsultado)
            return;
        }
     
        const resultado = await consultarCep(value)

        if (resultado == undefined) {
            errorMessage(`Não conseguimos encontrar nenhuma informação com o CEP ${cepDigitado} informado`)
            return
        }

        salvarCepConsultado(resultado)

        tratadorCep(resultado)


    } catch (e) {

    } finally {
        
        aposcoNSULTAdOcEP()
    }
})