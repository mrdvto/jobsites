package com.jobsites.crm.data.model

import kotlinx.serialization.Serializable

@Serializable
data class CustomerEquipment(
    val id: Int,
    val companyId: String,
    val equipmentType: String,
    val make: String,
    val model: String,
    val year: Int? = null,
    val serialNumber: String? = null,
    val smu: Int? = null,
    val uom: String? = null,
    val ownershipStatus: String // "owned" or "rented"
)
