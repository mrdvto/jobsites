package com.jobsites.crm.ui.screens.projectdetail.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Button
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.jobsites.crm.data.model.Note
import com.jobsites.crm.data.model.NoteTag
import com.jobsites.crm.ui.theme.TagAmber
import com.jobsites.crm.ui.theme.TagRed
import com.jobsites.crm.ui.theme.TagSky
import com.jobsites.crm.ui.theme.TagSlate

@OptIn(ExperimentalMaterial3Api::class, ExperimentalLayoutApi::class)
@Composable
fun NoteFormSheet(
    noteTags: List<NoteTag>,
    editingNote: Note? = null,
    onDismiss: () -> Unit,
    onSave: (content: String, tagIds: List<String>) -> Unit
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    var content by remember { mutableStateOf(editingNote?.content ?: "") }
    var selectedTagIds by remember { mutableStateOf(editingNote?.tagIds ?: emptyList()) }
    var error by remember { mutableStateOf<String?>(null) }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
                .navigationBarsPadding()
        ) {
            Text(
                text = if (editingNote != null) "Edit Note" else "Add Note",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )

            Spacer(Modifier.height(16.dp))

            // Content field
            OutlinedTextField(
                value = content,
                onValueChange = {
                    content = it
                    error = null
                },
                label = { Text("Content *") },
                minLines = 4,
                maxLines = 8,
                modifier = Modifier.fillMaxWidth(),
                isError = error != null
            )
            if (error != null) {
                Text(
                    text = error!!,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.error,
                    modifier = Modifier.padding(start = 4.dp, top = 2.dp)
                )
            }

            Spacer(Modifier.height(16.dp))

            // Tags
            Text(
                text = "Tags",
                style = MaterialTheme.typography.labelMedium,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
            Spacer(Modifier.height(8.dp))

            FlowRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                noteTags.forEach { tag ->
                    val selected = tag.id in selectedTagIds
                    val tagColor = when (tag.color) {
                        "red" -> TagRed
                        "amber" -> TagAmber
                        "sky" -> TagSky
                        else -> TagSlate
                    }
                    FilterChip(
                        selected = selected,
                        onClick = {
                            selectedTagIds = if (selected)
                                selectedTagIds - tag.id
                            else
                                selectedTagIds + tag.id
                        },
                        label = { Text(tag.label) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = tagColor.copy(alpha = 0.15f),
                            selectedLabelColor = tagColor
                        )
                    )
                }
            }

            Spacer(Modifier.height(24.dp))

            // Save button
            Button(
                onClick = {
                    if (content.isBlank()) {
                        error = "Please enter note content."
                        return@Button
                    }
                    onSave(content.trim(), selectedTagIds)
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(if (editingNote != null) "Save" else "Add Note")
            }

            Spacer(Modifier.height(16.dp))
        }
    }
}
