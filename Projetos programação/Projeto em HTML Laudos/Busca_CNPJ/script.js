document.getElementById('cnpjForm').addEventListener('submit', function(e){

e.preventDefault();

let cnpj = document.getElementById('cnpjInput').value.replace(/\D/g, '');
function formatCNPJ(cnpj){
    cnpj = cnpj.replace(/\D/g, '');
  return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}


if(cnpj.length !== 14){
    alert("CNPJ Inválido!!!")
    return;
}


fetch(`https://open.cnpja.com/office/${cnpj}`)
.then(Response =>{
    if(!Response.ok){
        throw new Error('Erro na consulta!');
    }
    return Response.json();
})

.then(data => {
document.getElementById('cnpjResultado').innerHTML=`<div class="card">
        <div class="card-body">
            <h5 class = "card-title">${data.company.name}</h5>
            <p><strong> CNPJ: </strong>${formatCNPJ(data.taxId)}</p>
            <p><strong> Atividade Principal: </strong>${data.mainActivity.text}</p>
            <p><strong> Membros: </strong>${data.company.members[0].person.name}</p>
            </div>`;

})           

});