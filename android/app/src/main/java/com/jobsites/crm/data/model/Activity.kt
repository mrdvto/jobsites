package com.jobsites.crm.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Activity(
    val id: Int,
    val statusId: Int,
    val salesRepId: Int,
    val typeId: String,
    val date: String,
    val description: String,
    val contactName: String = "",
    val notes: String = "",
    val campaignId: Int? = null,
    val issueId: Int? = null,
    val customerId: String? = null,
    val division: String? = null,
    val opportunityId: Int? = null,
    val previousRelatedActivityId: Int? = null
)
