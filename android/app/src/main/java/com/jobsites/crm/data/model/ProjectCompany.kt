package com.jobsites.crm.data.model

import kotlinx.serialization.Serializable

@Serializable
data class ProjectCompany(
    val companyId: String,
    val companyName: String,
    val roleId: String = "",
    val roleDescription: String = "",
    val roleIds: List<String>? = null,
    val roleDescriptions: List<String>? = null,
    val isPrimaryContact: Boolean = false,
    val companyContacts: List<CompanyContact> = emptyList(),
    val divisionIds: List<String>? = null,
    val primaryContactIndex: Int? = null
) {
    /** Returns all role IDs, falling back to single roleId if roleIds is empty/null */
    fun getAllRoleIds(): List<String> =
        roleIds?.takeIf { it.isNotEmpty() } ?: listOfNotNull(roleId.takeIf { it.isNotEmpty() })

    /** Returns all role descriptions, falling back to single roleDescription if roleDescriptions is empty/null */
    fun getAllRoleDescriptions(): List<String> =
        roleDescriptions?.takeIf { it.isNotEmpty() } ?: listOfNotNull(roleDescription.takeIf { it.isNotEmpty() })

    /** Returns the primary contact, or null if none designated */
    fun getPrimaryContact(): CompanyContact? =
        primaryContactIndex?.let { companyContacts.getOrNull(it) }
}
