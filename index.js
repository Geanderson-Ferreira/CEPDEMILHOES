  
  "use strict";

  async function consultarCEP(cep) {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
  
      if (data.erro) {
        console.log("CEP não encontrado")
        //throw new Error('CEP não encontrado');
      }
  
      const endereco = {
        CEP: data.cep,
        UF: data.uf,
        CIDADE: data.localidade,
        BAIRRO: data.bairro,
        LOGRADOURO: data.logradouro,
        COMPLEMENTO: data.complemento || null,
      };
  
      return endereco;
    } catch (error) {
      //console.log(error.message);
      //return null;
    }
  }


  //Funcao busca elemento por trecho de ID
function querySelectorIncludesText (selector, text){
  return Array.from(document.querySelectorAll(selector))
    .find(el => el.id.includes(text));
}

  function init() {
                                                 
  const rua = querySelectorIncludesText('input', "i3:0:fe1:tit8:odec_it_it::content") || querySelectorIncludesText('input', "i3:1:fe1:tit8:odec_it_it::content") || false
  const bairro = querySelectorIncludesText('input', "i3:0:fe4:tit2:odec_it_it::content") || querySelectorIncludesText('input', "i3:1:fe4:tit2:odec_it_it::content") || false
  const cidade = querySelectorIncludesText('input', "i3:0:fe16:tit5:odec_it_it::content") || querySelectorIncludesText('input', "i3:1:fe16:tit5:odec_it_it::content") || false
  const estado = querySelectorIncludesText('input', "i3:0:fe18:tlov2:odec_lov_itLovetext::content") || querySelectorIncludesText('input', "i3:1:fe18:tlov2:odec_lov_itLovetext::content") || false
  const complemento = querySelectorIncludesText('input', "i3:0:fe15:tit4:odec_it_it::content") || querySelectorIncludesText('input', "i3:1:fe15:tit4:odec_it_it::content") || false
  const cep = querySelectorIncludesText('input', "i3:0:fe40:tit6:occ_ic_it:odec_it_it::content") || querySelectorIncludesText('input', "i3:1:fe40:tit6:occ_ic_it:odec_it_it::content") || false
  


    if (cep.value.length == 8) {

        consultarCEP(cep.value).then((endereco) => {

            if (endereco) {
                
              //Preenchendo o campo rua
                if (rua){
                  if (endereco.LOGRADOURO !== undefined){
                    rua.value = endereco.LOGRADOURO;
                  }else{
                    rua.value = ""
                  }
                }
                
                //Preenchendo o campo Bairro
                if (bairro){
                  if(endereco.BAIRRO !== undefined){
                    bairro.value = endereco.BAIRRO;
                  }else{
                    bairro.value = ""
                  }
                }
                
                //Preenchendo o complemento
                if (complemento){
                  if(endereco.COMPLEMENTO !== undefined){
                    complemento.value = endereco.COMPLEMENTO;
                  }else{
                    complemento.value = ""
                  }
                }

                //Descomentar caso queira preencher cidade e estados
                if (cidade.value == ""){
                    //cidade.value = "Cidade Teste";
                }
                
                if (estado.value == ""){
                    //estado.value = "Estado Teste";
                }

                console.log(endereco);

            } else {

              if (cep.value.length !== 8){
                console.log("Cep com tamanho incorreto.(Não consultado)")
              } else {
                console.log(`Erro ao consultar o CEP: ${cep.value}`);
                }

            
            }
          });

               //Faz o campo cidade ser obrigatório
              if (cep.value.length == 8 && cidade.value == ""){
                setTimeout(function(){   
                                
                  const cidade = querySelectorIncludesText('input', "i3:0:fe16:tit5:odec_it_it::content") || querySelectorIncludesText('input', "i3:1:fe16:tit5:odec_it_it::content") || false
                  const cep = querySelectorIncludesText('input', "i3:0:fe40:tit6:occ_ic_it:odec_it_it::content") || querySelectorIncludesText('input', "i3:1:fe40:tit6:occ_ic_it:odec_it_it::content") || false
  
                  if (cep.value.length == 8 && cidade.value == ""){
                    window.alert("O Campo cidade precisa preencher automáticamente após inserção do CEP.")
                  }
                  },4000)  
              }
          
    
    } else {
        
        //window.alert("Query ainda nao encontrou");
    }
}


//Roda ao receber Tabs na janela Profile
document.addEventListener('keydown', function(event) {
    if (event.key === 'Tab') {

      const cep = querySelectorIncludesText('input', "i3:0:fe40:tit6:occ_ic_it:odec_it_it::content") || querySelectorIncludesText('input', "i3:1:fe40:tit6:occ_ic_it:odec_it_it::content") || false
                                                     
      "pt1:oc_pg_pt:r1:6:pt1:oc_prsnt_hdptqt:ode_prstn_bs:r2:0:ode_prsnt_panels:0:tf2:0:pt1:oc_pnl_cmp:oc_pnl_tmpl_knby27:ode_pnl_tmpl:p3:occ_pnl:ode_pnl_tmpl:i3:1:fe40:tit6:occ_ic_it:odec_it_it::content"
      const numero = querySelectorIncludesText('input', 'ode_pnl_tmpl:i3:0:fe6:tit9:odec_it_it::content') || false

      //Se conseguir obter o cep é pq chegamos onde queríamos
      if (cep){
        cep.addEventListener('input', init)
      }

      //Se consegue obter o numero, vai verificar se é apenas numérico
      if (numero){
        numero.addEventListener('input', function() {

            //Verifica se o valor no número é numérico
            if (!isNaN(Number(numero.value))) {
              console.log("Numero resid. com valor numérico OK.");

            } else {
              numero.value = "";
              }
        })

      }
      init()
    };
});
