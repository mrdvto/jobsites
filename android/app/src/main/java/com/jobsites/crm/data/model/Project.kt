package com.jobsites.crm.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Address(
    val street: String = "",
    val city: String = "",
    val state: String = "",
    val zipCode: String = "",
    val country: String = "",
    val latitude: Double = 0.0,
    val longitude: Double = 0.0
)

@Serializable
data class ProjectOwner(
    val companyId: String = "",
    val contactIds: List<Int> = emptyList()
)

@Serializable
data class AssociatedOpportunity(
    val id: Int,
    val type: String,
    val description: String,
    val stageId: Int,
    val revenue: Double
)

@Serializable
data class ExternalReference(
    val source: String,
    val url: String,
    val name: String
)

@Serializable
data class Project(
    val id: Int,
    val name: String,
    val description: String = "",
    val statusId: String = "Active",
    val assigneeIds: List<Int> = emptyList(),
    val projectOwner: ProjectOwner = ProjectOwner(),
    val address: Address = Address(),
    @SerialName("siteCompanies")
    val projectCompanies: List<ProjectCompany> = emptyList(),
    val associatedOpportunities: List<AssociatedOpportunity> = emptyList(),
    val notes: List<Note> = emptyList(),
    val activities: List<Activity> = emptyList(),
    val customerEquipment: List<Int> = emptyList(),
    val valuation: Long? = null,
    val primaryStageId: String? = null,
    val primaryProjectTypeId: String? = null,
    val ownershipTypeId: String? = null,
    val bidDate: String? = null,
    val targetStartDate: String? = null,
    val targetCompletionDate: String? = null,
    val externalReference: ExternalReference? = null
)
