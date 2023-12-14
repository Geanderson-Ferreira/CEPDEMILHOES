"use strict";

//true para visualizar log no console do navegador
const DEBUGGING_ON_CONSOLE = false

//FUNCAO PRINCIPAL. Executa a cada 4 segundos procurando os inputs de endereço
this.setInterval(
    function(){
     loopWindowAndFramesAndCheckInputs()
    },4000)

//Objeto com partes dos Ids dos inputs
const textIdsIncludes = {
    cep: ["fe40:tit6:occ_ic_it:odec_it_it::content"],
    rua: ["fe1:tit8:odec_it_it::content"],
    bairro: ["fe4:tit2:odec_it_it::content"],
    cidade:["fe16:tit5:odec_it_it::content"],
    estado:["fe18:tlov2:odec_lov_itLovetext::content"],
    complemento:["fe15:tit4:odec_it_it::content"],
    buttonCallShare: ["c_pnl_tmpl_17k92q:ode_pnl_tmpl:fe1:slov1:oc_srclov_input:oc_srclov_dummy_link"],
    placeToAlert: ['ode_pnl_tlbr_cntnr', 'oc_pnl_tmpl_knby27:ode_pnl_tmpl:oc_pnl_axnbr_cntnr', ':dc_cbi1:odec_cb_itm']
}

//Funçao basica de log
const log = {
    log: function(msg){
        if (DEBUGGING_ON_CONSOLE){
            console.log(msg)
        }
    }
}

// Opcoes disponiveis: "rua", "bairro", "cidade", "estado", "complemento"
// Sempre em lowerCase()
const fieldsYouWantToAutoFill = ['rua', 'bairro', 'complemento']

//Funcao para retirar os acentos dos endereços
function normalizeString(string_text){
    return string_text.normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

//Funcao consulta CEP API
async function consultarCEP(cep) {
    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
            log.log("CEP não encontrado")
            //throw new Error('CEP não encontrado');
        }

        const endereco = {
            cep: normalizeString(data.cep),
            estado: normalizeString(data.uf),
            cidade: normalizeString(data.localidade),
            bairro: normalizeString(data.bairro),
            rua: normalizeString(data.logradouro),
            complemento: normalizeString(data.complemento) || null,
        };

        return endereco;
    } catch (error) {
        log.log(error.message);
        //return null;
    }
}

//Funcao busca elemento por trecho de ID
function querySelectorByIdIncludesText (selector, possibleText, win = window){
    
    for (let text of possibleText){
        let resultado = Array.from(win.document.querySelectorAll(selector)).find(el => el.id.includes(text)) || false;
        if (resultado){
            return resultado;
        }
    }
    return false;
}

//Funcao busca elemento por trecho de content
function querySelectorByContentIncludesText (selector, possibleText, win = window){

    for (let text of possibleText){
        let resultado = Array.from(win.document.querySelectorAll(selector)).find(el => el.textContent.includes(text) || el.innerText.includes(text)) || false;
        if (resultado){
            log.log("TIPO RESULTADO", typeof(resultado))
            return resultado;
        }
    }
    return false;
}

//Alerta passageiro informando o preenchimento dos dados
function alertaInfo(texto, local, tempo){

    //Elemento a ser criado
    var alertElement = document.createElement("div");
    alertElement.innerHTML = `<p>${texto}</p>`;
    alertElement.style.position = "fixed";
    alertElement.style.top = "50%";
    alertElement.style.left = "50%";
    alertElement.style.transform = "translate(-50%, -50%)";
    alertElement.style.padding = "20px";
    alertElement.style.backgroundColor = "#f0f0f0";
    alertElement.style.border = "1px solid #ccc";
    alertElement.style.boxShadow = "0 0 6px rgba(0, 0, 0, 0.5)";
    alertElement.style.zIndex = 9999999999999
    alertElement.style.fontFamily = "Arial, sans-serif";
    alertElement.style.fontSize = "16px";
    alertElement.style.color = "#333";

    //Inicia oculto, exibe e oculta em determinado tempo
    alertElement.style.display = "none";
    if(local){
        local.appendChild(alertElement);
    }
    alertElement.style.display = "block";
    setTimeout(function() {
    alertElement.style.display = "none";    
    }, tempo);

}

//Funcao que retorna um objeto com os inputs
const formInputs = function (win = window){

    return {
        cep : querySelectorByIdIncludesText ('input', textIdsIncludes.cep, win),
        rua: querySelectorByIdIncludesText ('input', textIdsIncludes.rua, win),
        bairro: querySelectorByIdIncludesText ('input', textIdsIncludes.bairro, win),
        cidade: querySelectorByIdIncludesText ('input', textIdsIncludes.cidade, win),
        estado: querySelectorByIdIncludesText ('input', textIdsIncludes.estado, win),
        complemento: querySelectorByIdIncludesText ('input', textIdsIncludes.complemento, win),
        wereFounded : function(){
            if(this.cep && this.rua && this.complemento){
                return true
            }else{
                return false
            }
        },
    win : win
    }
}

//Se a numeracao do CEP estiver certa, consulta a API e preenche os demais campos
function mayFillAdress(inputForm){

    if (inputForm.cep.value.length == 8){
        consultarCEP(inputForm.cep.value).then((correiosData) => {
            if(correiosData){

                log.log(correiosData)

                for (let field of fieldsYouWantToAutoFill){
                    if (correiosData[field] !== undefined){
                        inputForm[field].value = correiosData[field]
                    }else{
                        inputForm[field].value = ""
                    }
                }

            alertaInfo('Preenchido com CEPDEMILHÕES ;)', document.body, 1500)

            }
        })
    }
}

//Funcao que percorre a window e os frames para encontrar os inputs
//Ao encontrar coloca um event listener no CEP
function loopWindowAndFramesAndCheckInputs(){

    for (let i = 0; i < window.frames.length; i++) {
 
        if(formInputs(window.frames[i]).wereFounded()){
            log.log('Encontrou os inputs em um frame.')
            formInputs(window.frames[i]).cep.addEventListener('input', function(){
                mayFillAdress(formInputs(window.frames[i]))
            })
            return
        }
      }
      
        if(formInputs(window).wereFounded()){
            log.log("Encontrou os inputs fora de um frame.")
            formInputs(window).cep.addEventListener('input',function(){
                mayFillAdress(formInputs(window))
            })
            return        
        }

    log.log('Nao Localizou os inputs.')
}