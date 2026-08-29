/* Aplica o tema que o app passou pela URL (?tema=claro|escuro) e mantém o link
   "treinar questões" apontando para o tema certo do banco. Sem isso a leitura
   aberta dentro do app ficaria clara com o app escuro. */
(function(){
  try{
    var t=new URLSearchParams(location.search).get("tema");
    if(t==="claro"||t==="escuro")document.documentElement.dataset.tema=t;
  }catch(e){}
  addEventListener("message",function(e){
    if(e.data&&e.data.tt==="tema"&&(e.data.v==="claro"||e.data.v==="escuro"))
      document.documentElement.dataset.tema=e.data.v;
  });
})();
