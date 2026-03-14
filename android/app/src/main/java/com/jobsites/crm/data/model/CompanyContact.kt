package com.jobsites.crm.data.model

import kotlinx.serialization.Serializable

@Serializable
data class CompanyContact(
    val id: Int,
    val name: String,
    val firstName: String? = null,
    val lastName: String? = null,
    val title: String? = null,
    val typeCode: String? = null,
    val typeDescription: String? = null,
    val phone: String = "",
    val mobilePhone: String? = null,
    val businessPhone: String? = null,
    val email: String = "",
    val fax: String? = null,
    val spouse: String? = null,
    val address1: String? = null,
    val address2: String? = null,
    val address3: String? = null,
    val city: String? = null,
    val state: String? = null,
    val zipCode: String? = null,
    val mainDivision: String? = null,
    val divisionIds: List<String>? = null,
    val mailCodes: List<String>? = null
)
