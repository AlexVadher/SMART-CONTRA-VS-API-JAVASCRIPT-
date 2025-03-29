// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MembresiaToken {
    address public owner;
    uint256 public precioToken;
    mapping(address => bool) public miembros;

    event Comprado(address indexed comprador);
    event Transferido(address indexed de, address indexed a);

    constructor(uint256 _precioToken) {
        owner = msg.sender;
        precioToken = _precioToken;
    }

    function comprarToken() public payable {
        require(msg.value >= precioToken, "Saldo insuficiente");
        miembros[msg.sender] = true;
        emit Comprado(msg.sender);
    }

    function transferirMembresia(address _destinatario) public {
        require(miembros[msg.sender], "No tienes un token de membresia");
        miembros[msg.sender] = false;
        miembros[_destinatario] = true;
        emit Transferido(msg.sender, _destinatario);
    }

    function retirarFondos() public {
        require(
            msg.sender == owner,
            "Solo el propietario puede retirar fondos"
        );
        payable(owner).transfer(address(this).balance);
    }
}
