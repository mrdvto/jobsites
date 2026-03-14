package com.jobsites.crm.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Attachment(
    val id: Int,
    val fileName: String,
    val fileUrl: String,
    val fileType: String,
    val fileSize: Long,
    val uploadedAt: String
)

@Serializable
data class NoteModification(
    val modifiedAt: String,
    val modifiedById: Int,
    val summary: String,
    val previousContent: String? = null,
    val previousTagIds: List<String>? = null
)

@Serializable
data class Note(
    val id: Int,
    val content: String,
    val createdAt: String,
    val createdById: Int,
    val tagIds: List<String> = emptyList(),
    val attachments: List<Attachment> = emptyList(),
    val lastModifiedAt: String? = null,
    val lastModifiedById: Int? = null,
    val modificationHistory: List<NoteModification>? = null
)

@Serializable
data class NoteTag(
    val id: String,
    val label: String,
    val displayOrder: Int,
    val color: String
)
