// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ApartmentRental {
    address public landlord;
    address public tenant;
    uint256 public rentAmount; // Monto de la renta mensual en wei
    uint256 public securityDeposit;
    uint256 public rentalPeriod;
    uint256 public startTime;
    bool public isActive;

    event ContractSigned(address indexed tenant, uint256 startTime);
    event RentPaid(address indexed tenant, uint256 amount);
    event FundsWithdrawn(address indexed landlord, uint256 amount);
    event ContractTerminated(address indexed tenant, uint256 refund);

    modifier onlyLandlord() {
        require(
            msg.sender == landlord,
            "Solo el propietario puede realizar esta accion"
        );
        _;
    }

    modifier onlyTenant() {
        require(
            msg.sender == tenant,
            "Solo el inquilino puede realizar esta accion"
        );
        _;
    }

    constructor(
        uint256 _rentAmount,
        uint256 _securityDeposit,
        uint256 _rentalPeriod
    ) {
        landlord = msg.sender;
        rentAmount = _rentAmount;
        securityDeposit = _securityDeposit;
        rentalPeriod = _rentalPeriod;
        isActive = false;
    }

    function signContract() external payable {
        require(!isActive, "El contrato ya esta activo");
        require(
            msg.value == securityDeposit,
            "Se requiere el deposito de seguridad"
        );

        tenant = msg.sender;
        startTime = block.timestamp;
        isActive = true;

        emit ContractSigned(tenant, startTime);
    }

    // 🔹 CORRECCIÓN AQUÍ
    function payRent() external payable onlyTenant {
        require(isActive, "El contrato no esta activo");
        require(
            msg.value == rentAmount,
            "Monto de renta incorrecto. Debes enviar el monto exacto en wei."
        );

        emit RentPaid(msg.sender, msg.value);
    }

    function withdrawFunds() external onlyLandlord {
        uint256 balance = address(this).balance;
        require(balance > 0, "No hay fondos para retirar");

        payable(landlord).transfer(balance);

        emit FundsWithdrawn(landlord, balance);
    }

    function terminateContract() external onlyLandlord {
        require(isActive, "El contrato no esta activo");
        require(
            block.timestamp >= startTime + rentalPeriod,
            "El periodo de alquiler no ha terminado"
        );

        isActive = false;

        uint256 refund = securityDeposit;
        securityDeposit = 0;

        payable(tenant).transfer(refund);

        emit ContractTerminated(tenant, refund);
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // 🔹 NUEVA FUNCIÓN PARA VALIDAR EL MONTO DE RENTA
    function getRentAmount() external view returns (uint256) {
        return rentAmount;
    }
}
