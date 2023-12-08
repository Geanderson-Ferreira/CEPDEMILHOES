"use strict";

//Objeto com partes dos Ids dos inputs
const textIdsIncludes = {
    cep: ["fe40:tit6:occ_ic_it:odec_it_it::content", "fe40:tit6:occ_ic_it:odec_it_it::content"],
    rua: ["fe1:tit8:odec_it_it::content", "fe1:tit8:odec_it_it::content"],
    bairro: ["fe4:tit2:odec_it_it::content", "fe4:tit2:odec_it_it::content"],
    cidade:["fe16:tit5:odec_it_it::content", "fe16:tit5:odec_it_it::content"],
    estado:["fe18:tlov2:odec_lov_itLovetext::content", "fe18:tlov2:odec_lov_itLovetext::content"],
    complemento:["fe15:tit4:odec_it_it::content", "fe15:tit4:odec_it_it::content"],
    buttonCallShare: ["c_pnl_tmpl_17k92q:ode_pnl_tmpl:fe1:slov1:oc_srclov_input:oc_srclov_dummy_link"],
    placeToAlert: ['oc_pnl_tmpl_knby27:ode_pnl_tmpl:oc_pnl_axnbr_cntnr', ':dc_cbi1:odec_cb_itm']
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
            console.log("CEP não encontrado")
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
        //console.log(error.message);
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

function alertaInfo(texto, local, tempo){
    var meuFrame = document.createElement("div");
    meuFrame.innerHTML = `<p>${texto}</p>`;
    meuFrame.style.position = "fixed";
    meuFrame.style.top = "50%";
    meuFrame.style.left = "50%";
    meuFrame.style.transform = "translate(-50%, -50%)";
    meuFrame.style.padding = "20px";
    meuFrame.style.backgroundColor = "#f0f0f0";
    meuFrame.style.border = "1px solid #ccc";
    meuFrame.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
    meuFrame.style.display = "none"; // Inicialmente, o frame estará oculto

    // Adiciona o frame ao corpo do documento
    if(local){
        local.appendChild(meuFrame);
    }
    
    // Exibe o frame
    meuFrame.style.display = "block";

    // Oculta o frame após 8 segundos
    setTimeout(function() {
    meuFrame.style.display = "none";
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
        }
    }

}


function mayFillAdress(inputForm){

    if (inputForm.cep.value.length == 8){
        consultarCEP(inputForm.cep.value).then((endereco) => {
            if(endereco){

                console.log(endereco)

                for (let field of fieldsYouWantToAutoFill){
                    if (endereco[field] !== undefined){
                        inputForm[field].value = endereco[field]
                    }else{
                        inputForm[field].value = ""
                    }
                }
            const local = querySelectorByIdIncludesText('span', textIdsIncludes.placeToAlert)
            alertaInfo('Preenchido com CEPDEMILHOES.', local, 1000)
            }
        })
    }
}


//Funcao que percorre a window e os frames para encontrar os inputs
//Ao encontrar coloca um event listener no CEP
function loopWindowAndFramesAndCheckInputs(){

    for (let i = 0; i < window.frames.length; i++) {
        if(formInputs(window.frames[i]).wereFounded()){
            console.log('Encontrou os inputs em um frame.')
            formInputs(window.frames[i]).cep.addEventListener('input', function(){
                mayFillAdress(formInputs(window.frames[i]))
            })
            return
        }
      }
      
        if(formInputs(window).wereFounded()){
            console.log("Encontrou os inputs fora de um frame.")
            formInputs(window).cep.addEventListener('input',function(){
                mayFillAdress(formInputs(window))
            })
            return        
        }

    console.log('Nao Localizou os inputs.')
}




window.addEventListener('click', loopWindowAndFramesAndCheckInputs)