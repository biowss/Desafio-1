let isFormValid = false;

  $(document).ready(function() {      
    // masks
  	$("#form_cpf").mask("000.000.000-00");
  	$("#form_cep").mask("00.000-000");
  	$("#form_phone").mask("(00) 00000-0000");
    $("#form_salary").maskMoney({
         decimal: ",",
         thousands: "."
     });
    $(".form-field-time").inputmask({
      "alias":"99:99", 
      "regex":"^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$",
      "showMaskOnHover": false,
    });

    // functions
    getStates();

    // EVENTS
    
    // Campos vazios
    $('.form-modal input').blur(function () {
      fieldNotEmpty(this);
    });
    
    // Verificação de email
    $('#form_email').blur(function () {
      fieldIsEmail(this)
    });
    
    // Verificação de habilitação
    $('.form-inline').change(function(){
      $('#form_category').parent().toggle();
    });
    
    // Aquisição de estados
    $('#form_state').change(function(){
      getCities($(this).val());
    });
    
    // Aquisição de endereço
    $('#form_cep').blur(function() { 
      getCep($(this).val())
    });

    // Carga horaria
    $('.form-field-time').blur(function() { 
      calculateWorkload(this)
    });
    $('.form-field-hour').blur(function() { 
      calculateWorkload(this)
    });
    
    // Validação de campos no envio
    $('#form_send').click(function(e) { 
      if(!validateFields()){
        e.preventDefault();
      }
    });   
  });

  function getCities(state) {
    let cities = '<option value="" selected> :.. Selecione ..: </option>';

    $.ajax({
      type: 'GET',
      url: `http://api.londrinaweb.com.br/PUC/Cidades/${state}/BR/0/10000`,
      contentType: "application/json; charset=utf-8",
      dataType: "jsonp",
      async: false
    }).done(function(response){
      $.each(response, function(index, city){
        cities += `<option value="${city}">${city}</option>`;
      });

      // PREENCHE AS CIDADES DE ACORDO COM O ESTADO
      $('#form_city').html(cities);
    });
  }

  function getStates() {
    let states = '<option value="" selected> :.. Selecione ..: </option>';

    $.ajax({
      type: 'GET',
      url: 'http://api.londrinaweb.com.br/PUC/Estados/BR/0/10000',
      contentType: "application/json; charset=utf-8",
      dataType: "jsonp",
      async: false
    }).done(function(response){
      $.each(response, function(index, state){
        states += `<option value="${state.UF}">${state.Estado}</option>`;
      });

      // PREENCHE OS ESTADOS BRASILEIROS
      $('#form_state').html(states);

      // CHAMA A FUNÇÃO QUE PREENCHE AS CIDADES DE ACORDO COM O ESTADO
      getCities($('#form_state').val());
    });
  }

  function getCep(cep) {
    cep = cep.replace(/[^0-9]/g, '');
    $.ajax({
      type:'GET',
      url: `https://viacep.com.br/ws/${cep}/json/`,
      contentType: "application/json; charset=utf-8",
      dataType: "jsonp",
      async: false,
      error: function(e){}
    }).done(function(response){
      if(response.erro) {
        $('#form_cep').parent().find('.form-field-validator').html("Cep não encontrado!");
      }
      else if((response.localidade != $(form_city).val()) && $(form_city).val() != ''){
        $('#form_cep').parent().find('.form-field-validator').html("Cep não pertence a cidade selecionada!");
      }
      else{
        $('#form_street').val(response.logradouro);
        $('#form_number').val(response.numero);
        $('#form_complement').val(response.complemento);
        $('#form_cep').parent().find('.form-field-validator').html("");
      }
    });
  }

  function validateFields() {
    let usernameEmpty = fieldNotEmpty('#form_username');
    let isEmail = fieldIsEmail('#form_email');
    let emailEmpty = fieldNotEmpty('#form_email');
    let cpfEmpty = fieldNotEmpty('#form_cpf');
    let phoneEmpty = fieldNotEmpty('#form_phone');
    let stateEmpty = fieldNotEmpty('#form_state');
    let cityEmpty = fieldNotEmpty('#form_city');
    let cepEmpty = fieldNotEmpty('#form_cep');
    let streetEmpty = fieldNotEmpty('#form_street');
    let numberEmpty = fieldNotEmpty('#form_number');
    let roleEmpty = fieldNotEmpty('#form_role');
    let salaryEmpty = fieldNotEmpty('#form_salary') ;
    let timeEmpty = fieldNotEmpty('.form-field-time');
    let hourEmpty = fieldNotEmpty('.form-field-hour');

    let workloadIsValid = false;
    let totalWorkload = 0;

    totalWorkload = calculateTotalWorkload();
    (totalWorkload < 10 || totalWorkload > 40) ? workloadIsValid = false : workloadIsValid = true;

    if (
      isEmail &&
      emailEmpty &&
      usernameEmpty &&
      cpfEmpty &&
      emailEmpty &&
      phoneEmpty &&
      stateEmpty &&
      cityEmpty &&
      cepEmpty &&
      streetEmpty &&
      numberEmpty &&
      roleEmpty &&    
      salaryEmpty &&    
      timeEmpty &&    
      hourEmpty &&
      workloadIsValid
    ){
      return true;
    } else{
      return false;
    }
  }
  
  function fieldNotEmpty(field, addClass = true, className = "input-invalid", errorMessage = "Campo obrigatório!", setParentClass = false ) {     
    if($(field).val().length == 0) {
      $(field).parent().find('.form-field-validator').html(errorMessage);

      if(addClass) {
        setParentClass ? $(field).parent().addClass(className) : $(field).addClass(className);
      }
      return false;
    }
    else{
      $(field).parent().find('.form-field-validator').html("");
      
      if(addClass) {
        setParentClass ? $(field).parent().removeClass(className) : $(field).removeClass(className);
      }
      return true;
    }
  }
  
  function fieldIsEmail(field, addClass = true, className = "input-invalid", errorMessage = "E-mail inválido!", setParentClass = false ) { 
    let email = $(field).val();
    let pattern = /^\b[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b$/i;

    if(!pattern.test(email)) {
      $(field).parent().find('.form-field-validator').html(errorMessage);
      setParentClass ? $(field).parent().addClass(className) : $(field).addClass(className);
      return false;
    }
    else{
      $(field).parent().find('.form-field-validator').html("");
      
      if(addClass) {
        setParentClass ? $(field).parent().removeClass(className) : $(field).removeClass(className);
      }
      return true;
    }
  }

  function timeIsValid(field, addClass = true, className = "input-invalid", setParentClass = false ) { 
    let timeField = $(field).val()
    let time = timeField.split(':')
    let hour = time[0]
    let min =  time[1]
    let pattern = /_/

    if(pattern.test(timeField) || hour >= 24 || min >= 60 || time == '') {
      setParentClass ? $(field).parent().addClass(className) : $(field).addClass(className);
      return false;
    }    
    else {
      setParentClass ? $(field).parent().removeClass(className) : $(field).removeClass(className);
      return true
    }
  }

  function calculateTotalWorkload() {     
    var totalTime = 0;
    for(x = 0; x < 5; x++){
      let time = $(`#form_table_workload_${x}`).val()
      if(!isNaN(time) && time != ''){
        totalTime += parseInt($(`#form_table_workload_${x}`).val())
      }
    }
    if(totalTime < 20 || totalTime > 40){
      $('#form_table_workload_total').addClass("input-invalid")
    }
    else{
      $('#form_table_workload_total').removeClass("input-invalid")
    }

    return totalTime;
  }

  function calculateWorkload(field, className = "input-invalid", setParentClass = false) {
    const day = field.id.split('_')[3];

    let startInput = $(`#form_table_start_${day}`);
    let finishInput = $(`#form_table_finish_${day}`);
    let restInput = $(`#form_table_rest_${day}`);
    let workloadInput = $(`#form_table_workload_${day}`);
    let workloadTotalInput = $(`#form_table_workload_total`);

    let startIsValid = timeIsValid(startInput);
    let finishIsValid = timeIsValid(finishInput);
    let restIsValid = fieldNotEmpty(restInput);

    if(startIsValid && finishIsValid && restIsValid){
      let startTime = moment(startInput.val(), "H:mm a");
      let finishTime = moment(finishInput.val(), "H:mm a");
    

      let newWorkload = moment(finishTime).diff(moment(startTime), 'hours');
      
      if(newWorkload < 0) {
        workloadInput.val('-');
        workloadTotalInput.val('-');
        
        setParentClass ? $(startInput).parent().addClass(className) : $(startInput).addClass(className);      
        setParentClass ? $(finishInput).parent().addClass(className) : $(finishInput).addClass(className);
      }
      else{
        setParentClass ? $(startInput).parent().removeClass(className) : $(startInput).removeClass(className);
        setParentClass ? $(finishInput).parent().removeClass(className) : $(finishInput).removeClass(className);
      }

      let totalWorkload = newWorkload - parseInt(restInput.val());

      if(totalWorkload < 0) {
        workloadInput.val('-');
        setParentClass ? $(restInput).parent().addClass(className) : $(restInput).addClass(className);
      }
      else {
        setParentClass ? $(restInput).parent().removeClass(className) : $(restInput).removeClass(className);
        if(totalWorkload > 10){
          setParentClass ? $(workloadInput).parent().addClass(className) : $(workloadInput).addClass(className);
          alert('Carga horaria do dia acima de 10h!');
          workloadInput.val(totalWorkload);
        } 
        else {
          workloadInput.val(totalWorkload);
        }

        let totalTime = calculateTotalWorkload();

        workloadTotalInput.val(totalTime);

        if(totalTime > 40 || totalTime < 20 ) {
          alert('Carga horaria deve ser entre 20h!')  ;           
        } 
      }   
    }
  }
