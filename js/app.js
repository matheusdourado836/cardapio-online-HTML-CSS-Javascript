$(document).ready(function () {
    cardapio.eventos.init();
});

var cardapio = {};

var MEU_CARRINHO = [];

var MEU_ENDERECO = null;

var SUB_TOTAL = 0;

var VALOR_ENTREGA = 5;

cardapio.eventos = {
    init: () => {
        cardapio.metodos.loadItensCardapio();
        cardapio.metodos.loadItensCarrinho();
        cardapio.metodos.carregarBotaoLigar();
        cardapio.metodos.carregarBotaoReserva();
    }
}

cardapio.metodos = {
    loadItensCardapio: (categoria = 'burgers', vermais = false) => {
        var filtro = MENU[categoria];

        if(!vermais) {
            $("#itensCardapio").html('');
        }
        
        $.each(filtro, (i, e) => {
            let template = cardapio.templates.item
            .replace(/\${img}/g, e.img)
            .replace(/\${nome}/g, e.name)
            .replace(/\${id}/g, e.id)
            .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','));

            if(!vermais && i < 8 && i < 12) {
                $("#itensCardapio").append(template);
            }
            if(vermais && i >= 8 && i < 12) {
                $("#itensCardapio").append(template);
            }
        })

        $(".container-menu a").removeClass('active');

        $("#menu-" + categoria).addClass('active');
    },

    loadItensCarrinho: () => {
        cardapio.metodos.carregarEtapa(1);
        var carrinho = localStorage.getItem('carrinho');
        $("#itensCarrinho").html('');
        if(carrinho != null && JSON.parse(carrinho).length > 0) {
            cardapio.metodos.atualizarBadge();
            $.each(JSON.parse(carrinho), (i, e) => {
                let templateCarrinho = cardapio.templates.itemCarrinho
                .replace(/\${img}/g, e.img)
                .replace(/\${nome}/g, e.name)
                .replace(/\${id}/g, e.id)
                .replace(/\${preco}/g, e.price.toFixed(2).replace('.', ','))
                .replace(/\${qtd}/g, e.qtd);
    
                $("#itensCarrinho").append(templateCarrinho);
            
            });
            cardapio.metodos.calcularTotal();
        }else {
            $(".m-footer").empty();
            $("#itensCarrinho").html('<p class="carrinho-vazio"><i class="fa fa-shopping-bag"></i> Seu carrinho está vazio.</p>');
        }
    },

    loadResumo: () => {
        let carrinhoString = localStorage.getItem('carrinho') ?? '[]';
        let carrinhoObj = JSON.parse(carrinhoString);
        SUB_TOTAL = 0;

        $("#listaItensResumo").html('');
        $.each(carrinhoObj, (i, e) => {
            var total = 0;
            total = e.price * e.qtd;
            SUB_TOTAL += parseFloat(total);
            let templateCarrinho = cardapio.templates.itemCarrinhoFinal
            .replace(/\${img}/g, e.img)
            .replace(/\${nome}/g, e.name)
            .replace(/\${preco}/g, total.toFixed(2).replace('.', ','))
            .replace(/\${qtd}/g, e.qtd);

            $("#listaItensResumo").append(templateCarrinho);
        
        });

        $("#resumoEndereco").html(`${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero}, ${MEU_ENDERECO.bairro}`);
        $("#cidadeEndereco").html(`${MEU_ENDERECO.cidade} - ${MEU_ENDERECO.uf} / ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`);
    },

    calcularTotal: () => {
        var subTotal = 0;
        let carrinho = localStorage.getItem('carrinho');

        $("#lblSubTotal").text(`R$ 0,00`);
        $("#lblValorEntrega").text(`R$ + 0,00`);
        $("#lblTotal").text(`R$ 0,00`);

        $.each(JSON.parse(carrinho), (i, e) => {
            var total = 0;
            total = e.price * e.qtd;
            subTotal += parseFloat(total);
        });

        $("#lblSubTotal").text(`R$ ${subTotal.toFixed(2).replace('.', ',')}`);
        $("#lblValorEntrega").text(`R$ ${VALOR_ENTREGA.toFixed(2).replace('.', ',')}`);
        $("#lblTotal").text(`R$ ${(subTotal + VALOR_ENTREGA).toFixed(2).replace('.', ',')}`);
    },

    toggleVerMais: () => {
        var itensBuilt = $("#itensCardapio").find("div").filter('#item').length;
        var active = $(".container-menu a.active").attr("id").split('-')[1];
        if(itensBuilt > 8) {
            cardapio.metodos.loadItensCardapio(active, false);
            $("#btnVerMais").html('Ver mais');
        }else {
            cardapio.metodos.loadItensCardapio(active, true);
            $("#btnVerMais").html('Ver menos');
        }
    },

    toggleModalCarrinho: (carrinho) => {
        var total = 0;
        $.each(MEU_CARRINHO, (i, e) => { total += e.qtd; });

        
        if(carrinho == false) {
            $("#listaItensResumo").empty();
            $("#modalCarrinho").addClass('hidden'); 
        }
        if(total > 0 && carrinho) {
            cardapio.metodos.loadItensCarrinho();
            $("#modalCarrinho").removeClass('hidden');
        }
    },

    carregarEtapa: (etapa) => {
        if(etapa == 1) {
            $("#lblTituloEtapa").text('Seu carrinho:');
            $("#itensCarrinho").removeClass('hidden');
            $("#localEntrega").addClass('hidden');
            $("#resumoCarrinho").addClass('hidden');

            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');

            $("#btnEtapaPedido").removeClass('hidden');
            $("#btnEtapaEndereco").addClass('hidden');
            $("#btnEtapaResumo").addClass('hidden');
            $("#btnVoltar").addClass('hidden');
        }
        if(etapa == 2) {
            $("#lblTituloEtapa").text('Endereço de entrega');
            $("#localEntrega").removeClass('hidden');
            $("#itensCarrinho").addClass('hidden');
            $("#resumoCarrinho").addClass('hidden');

            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');
            $(".etapa2").addClass('active');

            $("#btnEtapaEndereco").removeClass('hidden');
            $("#btnEtapaResumo").addClass('hidden');
            $("#btnEtapaPedido").addClass('hidden');
            $("#btnVoltar").removeClass('hidden');
        }
        if(etapa == 3) {
            $("#lblTituloEtapa").text('Resumo do pedido');
            $("#localEntrega").addClass('hidden');
            $("#itensCarrinho").addClass('hidden');
            $("#resumoCarrinho").removeClass('hidden');

            $(".etapa").removeClass('active');
            $(".etapa1").addClass('active');
            $(".etapa2").addClass('active');
            $(".etapa3").addClass('active');

            $("#btnEtapaEndereco").addClass('hidden');
            $("#btnEtapaResumo").removeClass('hidden');
            $("#btnEtapaPedido").addClass('hidden');
            $("#btnVoltar").removeClass('hidden');
        }
    },

    voltarEtapa: () => {
        let etapa = $(".etapa.active").length - 1;

        cardapio.metodos.carregarEtapa(etapa);
    },

    diminuirQuantidade: (id) => {
        let qtdAtual = parseInt($("#qtd-" + id).text());

        if(qtdAtual > 0) {
            $("#qtd-" + id).text(qtdAtual - 1);
        }
    },

    aumentarQuantidade: (id) => {
        let qtdAtual = parseInt($("#qtd-" + id).text());
        $("#qtd-" + id).text(qtdAtual + 1);
    },

    adicionarAoCarrinho: (id) => {
        let carrinho = localStorage.getItem('carrinho') ?? '[]';
        let carrinhoObj = JSON.parse(carrinho);
        let qtdAtual = parseInt($("#qtd-" + id).text());
        if(qtdAtual > 0) {
            var active = $(".container-menu a.active").attr("id").split('-')[1];
            var filtro = MENU[active];
            let item = $.grep(filtro, (e, i) => { return e.id == id });
            let itensCarrinho = $.grep(carrinhoObj, (element, index) => { return element.id == id});
            if(itensCarrinho.length == 0) {
                item[0].qtd = qtdAtual;
                carrinhoObj.push(item[0]);
                localStorage.setItem('carrinho', JSON.stringify(carrinhoObj));
            }else {
                let objIndex = carrinhoObj.findIndex((obj => obj.id == id));
                carrinhoObj[objIndex].qtd = qtdAtual;
                localStorage.setItem('carrinho', JSON.stringify(carrinhoObj));
            }

            $("#qtd-" + id).text(0);
            cardapio.metodos.atualizarBadge();
            cardapio.metodos.mensagem('Item adicionado ao carrinho', 'green');
        }
        
    },

    diminuirQuantidadeCarrinho: (id) => {
        let qtdAtual = parseInt($("#qtd-carrinho-" + id).text());

        if(qtdAtual > 1) {
            $("#qtd-carrinho-" + id).text(qtdAtual - 1);
            cardapio.metodos.atualizarCarrinho(id, qtdAtual - 1);
        }else {
            cardapio.metodos.removerItemCarrinho(id); 
        }
    },

    aumentarQuantidadeCarrinho: (id) => {
        let qtdAtual = parseInt($("#qtd-carrinho-" + id).text());

        
        $("#qtd-carrinho-" + id).text(qtdAtual + 1);
        cardapio.metodos.atualizarCarrinho(id, qtdAtual + 1);
        
    },

    removerItemCarrinho: (id) => {
        let carrinhoString = localStorage.getItem('carrinho');
        let carrinhoObj = JSON.parse(carrinhoString);
        carrinhoObj = $.grep(carrinhoObj, (element, index) => { return element.id != id});
        localStorage.setItem('carrinho', JSON.stringify(carrinhoObj));

        cardapio.metodos.loadItensCarrinho();
        cardapio.metodos.atualizarBadge();

    },

    atualizarCarrinho: (id, newQtd) => {
        let carrinhoString = localStorage.getItem('carrinho');
        let carrinhoObj = JSON.parse(carrinhoString);
        let objIndex = carrinhoObj.findIndex((obj) => { return obj.id == id });
        carrinhoObj[objIndex].qtd = newQtd;
        localStorage.setItem('carrinho', JSON.stringify(carrinhoObj));

        cardapio.metodos.calcularTotal();
        cardapio.metodos.atualizarBadge();
    },

    atualizarBadge: () => {
        let carrinho = localStorage.getItem('carrinho');
        var total = 0;

        $.each(JSON.parse(carrinho), (i, e) => { total += e.qtd; });

        if(total > 0) {
            $(".botao-carrinho").removeClass("hidden");
            $(".container-total-carrinho").removeClass("hidden");
        }else {
            $(".botao-carrinho").addClass("hidden");
            $(".container-total-carrinho").addClass("hidden");
        }

        $(".badge-total-carrinho").html(total);
    },

    carregarEndereco: () => {
        let carrinho = localStorage.getItem('carrinho') ?? '[]';
        if(carrinho == '[]') {
            cardapio.metodos.mensagem('Seu carrinho está vazio!', 'red');
            return;
        }

        cardapio.metodos.carregarEtapa(2);
    },

    buscarCep: () => {
        const objetoComValores = {
            cep: $("#txtCEP").val().trim(),
            endereco: $("#txtEndereco").val().trim(),
            bairro: $("#txtBairro").val().trim(),
            cidade: $("#txtCidade").val().trim(),
            uf: $("#ddlUf").val().trim(),
            complemento: $("#txtComplemento").val().trim(),
            numero: $("#txtNumero").val().trim(),
        };
        var cep = $("#txtCEP").val().trim().replace(/\D/g, '');

        if(cep != '') {
            var validaCep = /^[0-9]{8}$/;

            
            $(".loading-indicator").css("display", "block");

            if(validaCep.test(cep)) {
                if(validaCep.test(cep) && $("#txtEndereco").val().length != 0) {
                    cardapio.metodos.limparValoresEndereco();
                }
                $.getJSON("https://viacep.com.br/ws/" + cep + "/json/?callback=?", function (dados) {
                    if(!("erro" in dados)) {
                        $.each(objetoComValores, (i, e) => {
                            if($("#error-" + i).hasClass("error animated shake")) {
                                $("#error-" + i).removeClass("error animated shake");
                            }
                        });

                        $("#txtEndereco").val(dados.logradouro).prop("disabled", true);
                        $("#txtBairro").val(dados.bairro).prop("disabled", true);
                        $("#txtCidade").val(dados.localidade).prop("disabled", true);
                        $("#ddlUf").val(dados.uf).prop("disabled", true);
                        $("#txtNumero").focus();
                    }else {
                        cardapio.metodos.mensagem('CEP não encontrado! Preencha as informações manualmente', 'red');
                        $("#txtEndereco").focus().prop("disabled", false);
                        $("#txtBairro").prop("disabled", false);
                        $("#txtCidade").prop("disabled", false);
                        $("#ddlUf").prop("disabled", false);
                    }

                    $(".loading-indicator").css("display", "none");
                });
            }else {
                cardapio.metodos.mensagem('Formato de CEP inválido', 'red');
                $(".loading-indicator").css("display", "none");
                $("#txtCEP").focus();
            }
        }else {
            $("#error-cep").removeClass("error animated shake");
            $("#error-cep").addClass("error animated shake");
            cardapio.metodos.mensagem('Informe o CEP por favor!', 'yellow');
            $("#txtCEP").focus();
        }
    },

    limparValoresEndereco: () => {
        $("#txtEndereco").val('');
        $("#txtBairro").val('');
        $("#txtCidade").val('');
        $("#ddlUf").val('');
    },

    resumoPedido: () => {
        var validate = false;
        const objetoComValores = {
            cep: $("#txtCEP").val().trim(),
            endereco: $("#txtEndereco").val().trim(),
            bairro: $("#txtBairro").val().trim(),
            cidade: $("#txtCidade").val().trim(),
            uf: $("#ddlUf").val().trim(),
            complemento: $("#txtComplemento").val().trim(),
            numero: $("#txtNumero").val().trim(),
        };

        $.each(objetoComValores, (i, e) => {
            if(e.length == 0 && i != 'complemento') {
                cardapio.metodos.mensagem(`Por favor preencha o campo ${i}`, 'yellow');
                $("#error-" + i).addClass("error animated shake");
                return;
            }else {
                $("#error-" + i).removeClass("error animated shake");
            }if(i == 'numero' && e.length != 0) {
                validate = true;
            }
        })

        if(validate) {
            MEU_ENDERECO = {
                ...objetoComValores
            };

            $.each(objetoComValores, (i, e) => {
                $("#error-" + i).removeClass("error animated shake");
            })
    
            cardapio.metodos.carregarEtapa(3);
            cardapio.metodos.loadResumo();
        }
    },

    finalizarPedido: () => {
        let carrinhoString = localStorage.getItem('carrinho') ?? '[]';
        let carrinhoObj = JSON.parse(carrinhoString);
        const dataAtual = new Date();

        const ano = dataAtual.getFullYear();
        const mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
        const dia = String(dataAtual.getDate()).padStart(2, '0');
        const horas = String(dataAtual.getHours()).padStart(2, '0');
        const minutos = String(dataAtual.getMinutes()).padStart(2, '0');
        const segundos = String(dataAtual.getSeconds()).padStart(2, '0');

        const dataCompleta = `${dia}/${mes}/${ano} ${horas}:${minutos}:${segundos}`;

        if(carrinhoObj.length > 0 && MEU_ENDERECO != null) {
            var texto = `*HAMBURGUERIA STEAK BBQ*\n\nOlá! gostaria de fazer um pedido:\n\n${dataCompleta}`;
            texto += `\n\nItens do pedido:\n-------------------------------------------------\n`;
            texto += `\${itens}`;
            texto += '-------------------------------------------------\n';           
            texto += `*Total (com entrega): R$ ${(SUB_TOTAL + VALOR_ENTREGA).toFixed(2).replace('.', ',')}*`;
            texto += `\n\n*Endereço de entrega:*`;
            texto += `\n${MEU_ENDERECO.endereco}, ${MEU_ENDERECO.numero} / ${MEU_ENDERECO.bairro}`;
            texto += `\n${MEU_ENDERECO.cidade} - ${MEU_ENDERECO.uf}, ${MEU_ENDERECO.cep} ${MEU_ENDERECO.complemento}`;

            var itens = '';

            $.each(carrinhoObj, (i, e) => {
                itens += `- *${e.qtd}x* ${e.name} .......... R$ ${e.price.toFixed(2).replace('.', ',')} \n`;

                if((i + 1) == carrinhoObj.length) {
                    texto = texto.replace(/\${itens}/g, itens);

                    let encode = encodeURI(texto);
                    let URL = `https://wa.me/SEU_NUMERO_AQUI?text=${encode}`;

                    $("#btnEtapaResumo").attr('href', URL);
                }
            });
        }
    },

    abrirDepoimento: (depoimento) => {
        $("#depoimento-1").addClass('hidden');
        $("#depoimento-2").addClass('hidden');
        $("#depoimento-3").addClass('hidden');

        $("#btnDepoimento-1").removeClass('active');
        $("#btnDepoimento-2").removeClass('active');
        $("#btnDepoimento-3").removeClass('active');

        $("#depoimento-" + depoimento).removeClass('hidden');
        $("#btnDepoimento-1" + depoimento).addClass('active');
    },

    mensagem: (texto, cor = 'red', tempo = 2500) => {
        let id = Math.floor(Date.now() * Math.random()).toString();
        let msg = ``;

        if(cor == 'green') {
            msg = `<div id="msg-${id}" class=" animated fadeInDown toast ${cor}"><span class="icon-left"><i class="fas fa-check-circle"></i></span>&nbsp; ${texto}</div>`;
        }else if(cor == 'yellow') {
            msg = `<div id="msg-${id}" class=" animated fadeInDown toast ${cor}"><span class="icon-left"><i class="fas fa-exclamation-circle"></i></span>&nbsp; ${texto}</div>`;
        }
        else {
            msg = `<div id="msg-${id}" class=" animated fadeInDown toast ${cor}"><span class="icon-left"><i class="fas fa-times-circle"></i></span>&nbsp; ${texto}</div>`;
        }
        $("#containerMensagens").append(msg);

        setTimeout(() => {
            $('#msg-' + id).removeClass('fadeInDown');
            $('#msg-' + id).addClass('fadeOutUp');
            setTimeout(() => {
                $('#msg-' + id).remove();
            }, 800)
        }, tempo);
    },

    carregarBotaoReserva: () => {
        var texto = 'Olá! gostaria de fazer uma *reserva*'

        let encode = encodeURI(texto);
        let URL = `https://wa.me/SEU_NUMERO_AQUI?text=${encode}`

        $("#btnReserva").attr('href', URL);
    },

    carregarBotaoLigar: () => {
        $("#btnLigar").attr('href', `tel:SEU_NUMERO_AQUI`);
    }
}

cardapio.templates = {
  item: `
    <div id="item" class="col-12 col-lg-3 col-md-3 col-sm-6 wow bounceIn">
        <div class="card card-item" id="\${id}">
            <div class="img-produto">
                <img src="\${img}" alt="">
            </div>
            <p class="title-produto text-center mt-4"><b>\${nome}</b></p>
            <p class="price-produto text-center"><b>R$\${preco}</b></p>
            <div class="add-carrinho">
                <span class="btn-menos" onClick="cardapio.metodos.diminuirQuantidade('\${id}')"><i class="fas fa-minus"></i></span>
                <span id="qtd-\${id}" class="add-numeros-itens">0</span>
                <span class="btn-mais" onClick="cardapio.metodos.aumentarQuantidade('\${id}')"><i class="fas fa-plus"></i></span>
                <span class="btn btn-add" onClick="cardapio.metodos.adicionarAoCarrinho('\${id}')"><i class="fa fa-shopping-bag"></i></span>
            </div>
        </div>
    </div>
    `,

  itemCarrinho: `
    <div class="col-12 item-carrinho">
            <div class="img-produto">
                <img src="\${img}" alt="Produto1" />
            </div>

            <div class="dados-produto">
                <p class="title-produto"><b>\${nome}</b></p>
                <p class="price-produto"><b>R$\${preco}</b></p>
            </div>

            <div class="add-carrinho">
                <span class="btn-menos" onClick="cardapio.metodos.diminuirQuantidadeCarrinho('\${id}')"><i class="fas fa-minus"></i></span>
                <span id="qtd-carrinho-\${id}" class="add-numeros-itens">\${qtd}</span>
                <span class="btn-mais" onClick="cardapio.metodos.aumentarQuantidadeCarrinho('\${id}')"><i class="fas fa-plus"></i></span>
                <span class="btn btn-remove no-mobile"  OnClick="cardapio.metodos.removerItemCarrinho('\${id}')"><i class="fa fa-times"></i></span>
            </div>

    </div>
  `,

  itemCarrinhoFinal: `
    <div class="col-12 item-carrinho resumo">
        <div class="img-produto-resumo">
            <img src="\${img}" alt="Item pedido">
        </div>
        <div class="dados-produto">
            <p class="title-produto-resumo"><b>\${nome}</b></p>
            <p class="price-produto-resumo"><b>R$\${preco}</b></p>
        </div>
        <p class="quantidade-produto-resumo">
            x <b>\${qtd}</b>
        </p>
    </div>
  `,
};